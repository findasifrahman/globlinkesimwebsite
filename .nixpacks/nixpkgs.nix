{
  pkgs ? import <nixpkgs> {}
}:

with pkgs;

let
  nodejs = nodejs-18_x;
  npm = nodejs.pkgs.npm;
in

{
  buildInputs = [
    nodejs
    npm
    python3
    python3Packages.pip
    curl
  ];
} 