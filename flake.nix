{
  description = "Gearshift - the modern WebUI for Transmission";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    let
      # Define the NixOS module independently of system
      nixosModule = { config, lib, pkgs, ... }:
        let
          cfg = config.services.gearshift;
          configJson = pkgs.writeText "config.json" (builtins.toJSON {
            OAUTH_CLIENT_ID = cfg.oauth.clientId;
            OAUTH_AUTHORITY = cfg.oauth.authority;
            OAUTH_REDIRECT_URI = if cfg.oauth.redirectUri != "" then cfg.oauth.redirectUri else null;
            OAUTH_SCOPE = cfg.oauth.scope;
            TRANSMISSION_RPC_URL = cfg.transmission.publicRpcUrl;
          });
        in
        {
          options.services.gearshift = {
            enable = lib.mkEnableOption "Gearshift WebUI for Transmission";

            server = {
              domain = lib.mkOption {
                type = lib.types.str;
                default = "localhost";
                description = "Domain name for the Nginx virtual host.";
              };
            };

            oauth = {
              clientId = lib.mkOption {
                type = lib.types.str;
                default = "gearshift";
                description = "OAuth Client ID";
              };
              authority = lib.mkOption {
                type = lib.types.str;
                default = "";
                example = "https://idm.example.com/oauth2/openid/gearshift";
                description = "OAuth Authority/Issuer URL";
              };
              redirectUri = lib.mkOption {
                type = lib.types.str;
                default = "";
                description = "OAuth Redirect URI (if empty, uses the origin from window.location)";
              };
              scope = lib.mkOption {
                type = lib.types.str;
                default = "openid profile email";
                description = "OAuth Scopes";
              };
            };

            transmission = {
              rpcUrl = lib.mkOption {
                type = lib.types.str;
                default = "http://127.0.0.1:9091";
                description = "Internal URL to the Transmission RPC daemon for proxying";
              };
              publicRpcUrl = lib.mkOption {
                type = lib.types.str;
                default = "";
                description = "Public URL given to the frontend to reach Transmission. If left empty, the frontend will use standard behavior or proxy through the same host if possible.";
              };
            };
          };

          config = lib.mkIf cfg.enable {
            services.nginx = {
              enable = true;
              virtualHosts.${cfg.server.domain} = {
                root = self.packages.${pkgs.system}.default;

                locations."/" = {
                  tryFiles = "$uri /index.html";
                };

                locations."=/config.json" = {
                  alias = "${configJson}";
                };

                locations."/transmission/rpc" = {
                  proxyPass = cfg.transmission.rpcUrl;
                  # Additional proxy settings if necessary
                };
              };
            };
          };
        };
    in
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        projectName = "gearshift";
      in
      {
        packages.default = pkgs.buildNpmPackage {
          pname = projectName;
          version = "0.1.0";

          src = ./.;

          npmDepsHash = lib.fakeHash; # Will need update since package-lock.json changed

          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r dist/* $out
            runHook postInstall
          '';
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [ pkgs.nodejs ];
          shellHook = ''
            echo "Welcome to the ${projectName} dev shell!"
          '';
        };
      }
    ) // {
      nixosModules.default = nixosModule;
      nixosModules.gearshift = nixosModule;
    };
}
