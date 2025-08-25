# flake.nix
{
  description = "A Vite React app packaged with Nix Flakes";

  # Define the external dependencies (inputs) for our project
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    dream2nix.url = "github:nix-community/dream2nix";
    gitignore = {
      url = "github:hercules-ci/gitignore.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  # Define the outputs of our flake (packages, shells, etc.)
  outputs = { self, nixpkgs, flake-utils, dream2nix }:
    # Use flake-utils to generate outputs for common systems (linux, macos)
    dream2nix.lib.makeFlakeOutputs {
      systems = flake-utils.lib.defaultSystems;
      config.projectRoot = ./.;
      source = gitignore.lib.gitignoreSource ./.;
    };
}