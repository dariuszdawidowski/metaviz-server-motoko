# Metaviz Server Motoko

Metaviz is a visual project collaboration workspace. Good for making diagrams, project management, storing files and media.

## 🎁 Project content

This repository contains Metaviz backend for the [Internet Computer](https://internetcomputer.org/) web3 blockchain written in [Motoko](https://github.com/dfinity/motoko) language.

Frontend refers to the admin and user panel, the diagram editor itself and other libraries are loaded directly from the CDN to simplify deploying. If you want to review the source code of these libraries - see the References section below.

## 🚀 Setup the project locally on Windows

- Install WSL2 [Guide](https://learn.microsoft.com/en-us/windows/wsl/install)
- Install CDK [Guide](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/)
- Install NodeJS [Download](https://nodejs.org/en/download/)

## 🚀 Setup the project locally on GNU/Linux and macOS

- Install CDK [Guide](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/)
- Install NodeJS [Download](https://nodejs.org/en/download/)

## 🐞 Troubleshooting on macOS

If you encounter an error related to 'esbuild' - run dfx in the terminal using Rosetta x86 compatibility mode.

## 🏃‍♂️ Running local blockchain replica

```bash
# Starts the replica, running in the background
dfx start --background

# Checking that process runs
lsof -i tcp:4943

# Stops the replica running in the background
dfx stop
```

```bash
# Or alternatively you can run it in a separate console without a background process
dfx start
```

## 🚚 Deploying the project locally

If you want to test your project locally, you can use the following command:

```bash
# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

Once the job completes, your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.

If you have made changes to your backend canister, you can generate a new candid interface with

```bash
npm run generate
```

at any time. This is recommended before starting the frontend development server, and will be run automatically any time you run `dfx deploy`.

If you are making frontend changes, you can start a development server with

```bash
npm start
```

Which will start a server at `http://localhost:8080`, proxying API requests to the replica at port 4943.

### Note on frontend environment variables

If you are hosting frontend code somewhere without using DFX, you may need to make one of the following adjustments to ensure your project does not fetch the root key in production:

- set`DFX_NETWORK` to `ic` if you are using Webpack
- use your own preferred method to replace `process.env.DFX_NETWORK` in the autogenerated declarations
  - Setting `canisters -> {asset_canister_id} -> declarations -> env_override to a string` in `dfx.json` will replace `process.env.DFX_NETWORK` with the string in the autogenerated declarations
- Write your own `createActor` constructor

## 🚛 Deploy the project on the mainnet

```bash
# Make sure which identity do you use
dfx identity use {name}

# Deploy to mainnet
dfx deploy --ic
```

## 🔗 References

- [Internet Computer](https://internetcomputer.org)
- [Motoko Language](https://github.com/dfinity/motoko)
- [Metaviz Editor](https://github.com/dariuszdawidowski/metaviz-editor)
- [Total Diagram](https://github.com/dariuszdawidowski/total-diagram)
- [Total Popup](https://github.com/dariuszdawidowski/total-popup)
- [Total Pro Menu](https://github.com/dariuszdawidowski/total-pro-menu)
- [Total Text](https://github.com/dariuszdawidowski/total-text)

## 📝 External Licenses

- Logo ICP.svg has separate license. For more information refer [Internet Computer website](https://internetcomputer.org).
- Logo NFID.avif has separate license. For more information refer [Identity Kit website](https://docs.identitykit.xyz).
