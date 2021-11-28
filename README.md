# angelscripts-monorepo-packages

angelscripts for monorepo development of packages based on [organic-stem-skeleton 3.0](https://github.com/node-organic/organic-stem-skeleton)

## usage

```
$ npm i organic-angel
$ npm i angelscripts-monorepo-packages
$ npx angel help package
```

## commands

### packages -- :cmd

Executes `cmd` on all repo packages found under `dna.packages` namespace.

### package :name -- :cmd

Executes `cmd` on specific repo package found under `dna.packages` namespace.

### packages

Lists all found packages under repo

### packages.json

Returns JSON list of found packages

### create package

Enters in intercative mode asking for package to be created with packageName.

#### create package :name

Scaffold a monorepo package and runs `npm init -y` on it.