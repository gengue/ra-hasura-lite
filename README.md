# ra-hasura-lite 

A lightweight data provider for react-admin.

This is an alternative to ra-hasura, because for larges schema the type-check on runtime will affect the performance and will drown the network. Instead of check the ASTypes on each request, this data provider is based on grapqh-simple to get tiny schema and is intended to be used along with graphql-codegen for safe type check but in compilation time. 

![NPM](https://img.shields.io/npm/l/@gengue/ra-hasura-lite)
![NPM](https://img.shields.io/npm/v/@gengue/ra-hasura-lite)
![GitHub Workflow Status](https://github.com/gengue/ra-hasura-lite/actions/workflows/ra-hasura-lite.yml/badge.svg?branch=main)

Yet another (opinionated) typescript library starter template.


## Getting started

`yarn add ra-hasura-lite`

## Features

