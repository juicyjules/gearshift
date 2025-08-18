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
    prismaEnginesPath = pkgs.prisma-engines;
  in{
    # Define packages for backend and frontend
    packages.${system} = {
      main = pkgs.stdenv.mkDerivation rec {
        pname = "cv-generator-frontend";
        version = "1.0.0";

        # Source directory for the frontend
        src = ./frontend;

        # Use node2nix to manage dependencies
        buildInputs = [ pkgs.nodejs pkgs.nodePackages.node2nix];

        preBuild = ''
        '';

        buildPhase = ''
          npm run build
        '';

        installPhase = ''
          mkdir -p $out
          cp -r build/* $out/
        '';
      };
    };

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
        echo "Backend development shell activated.";
        export PRISMA_QUERY_ENGINE_LIBRARY="${prismaEnginesPath}/lib/libquery_engine.node"
        export PRISMA_SCHEMA_ENGINE_BINARY="${prismaEnginesPath}/bin/schema-engine" # Or schema-engine
        export PRISMA_INTROSPECTION_ENGINE_BINARY="${prismaEnginesPath}/bin/introspection-engine"
        export PRISMA_FMT_BINARY="${prismaEnginesPath}/bin/prisma-fmt"
        export SKIP_PRISMA_VERSION_CHECK=true
        '';
    };
  };
}
