{
  description = "CV Generator with Node.js setup using Nix Flakes";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: let
    # Define the system architecture (e.g., x86_64-linux)
    system = "x86_64-linux";
    pkgs = import nixpkgs { inherit system; };
    nodejs = pkgs.nodejs;
    gearshift = {
      main = pkgs.stdenv.mkDerivation rec {
        pname = "gearshift";
        version = "1.0.0";

        # Source directory for the frontend
        src = ./.;

        # Use node2nix to manage dependencies
        buildInputs = [ pkgs.nodejs pkgs.nodePackages.node2nix];

        preBuild = ''
        '';

        buildPhase = ''
          npm run build
        '';

        installPhase = ''
          mkdir -p $out
          cp -r dist/* $out/
        '';
      };
    };
  in{
    # Development shell combining backend and frontend environments
    devShells.${system}.default = pkgs.mkShell {
      buildInputs = [
        pkgs.nodejs             # Add Node.js globally in shell
        pkgs.nodePackages.node2nix # Add node2nix for dependency management
        pkgs.sqlite
        pkgs.openssl
      ];
      shellHook = ''
        export NODE_ENV=development
        export PATH=$PATH:${pkgs.nodejs}/bin
        '';
    };
    packges.${system}.default = gearshift;
  };
}
