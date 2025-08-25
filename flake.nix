{
  description = "Gearshift - the modern WebUI for Transmission";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # Change this to your project name from package.json
        projectName = "gearshift";

      in
      {
        # The package for your final build artifacts (the 'dist' directory)
        packages.default = pkgs.buildNpmPackage {
          pname = projectName;
          version = "0.1.0"; # Or pull from package.json

          src = ./.;

          npmDepsHash = "sha256-lyZUlFFtr/7c6FOgfh8P+C4YwnHZEbJf5+PI2btSel8="; # Placeholder hash

          installPhase = ''
            runHook preInstall
            # Copy the build output (dist directory) to the Nix store
            mkdir -p $out
            cp -r dist/* $out
            runHook postInstall
          '';

          # Vite/NPM scripts
          # By default, buildNpmPackage runs `npm run build`, which is what Vite uses.
          # You can override build commands here if needed.
        };

        # The development shell
        devShells.default = pkgs.mkShell {
          buildInputs = [
            # Use a specific version of Node.js
            pkgs.nodejs 
          ];

          # You can add shell hooks here if needed
          shellHook = ''
            echo "Welcome to the ${projectName} dev shell!"
          '';
        };
      });
}