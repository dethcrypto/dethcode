# VSCode Web
This project is aimed to build a web version of VSCode, this is not a fork, simply a web compilation of the VSCode project.

A similar compilation is used to generate [VSCode Web test playground](https://vscode-web-test-playground.azurewebsites.net/).

## Use case
This project can be used to build a strong web file editor/reader. You need to implement your own [`FileSystemProvider`](https://code.visualstudio.com/api/references/vscode-api#FileSystemProvider) through extension. 
Additional you can also use [proposed API](https://code.visualstudio.com/api/advanced-topics/using-proposed-api) to implement a `TextSearchProvider` and `FileSearchProvider`.

Sample from official VSCode website consuming Github FileSystemProvider: [Demo](https://vscode-web-test-playground.azurewebsites.net/?enter=true&gh=microsoft/vscode) (requires Github access)

## Sample project
This project is aimed to be used through npm package to avoid consumer to recompile whole solution.

Sample project can be found in this repository to illustate vscode-web usage. This sample is not fully functional as it misses a `FileSystemProvider` extension.

To run sample project 
```sh
cd ./sample
yarn
yarn sample
```


## Build from source

To build from source, you need same prerequisites as vscode : 
[VSCode Prerequisites](https://github.com/microsoft/vscode/wiki/How-to-Contribute#prerequisites)

Then simply run following commands

```
yarn
yarn build
```

## Run demo

To run the demo you need to build from source, then run following commands

```
yarn prepare-demo
yarn demo
```
