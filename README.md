# DynamoDB Visualizer

Visualize DynamoDB tables in your browser, using example or live data.

[dynamodb-visualizer.bemit.codes](https://dynamodb-visualizer.bemit.codes/)

- define multiple tables
- visualize data with primary or secondary indexes
- save presets to reuse display columns
- requires input:
  - the table schema, e.g. the result of `describeTable` operation
  - example table data, e.g. a dump result of `scan` operation
- saving settings and tables-meta in `localStorage`, nothing is transmitted to a different system
- optional scan endpoint for live data: a URL which must return the result of a `scan` operation
    - is only executed from your browser, nothing transmitted over other servers
    - would require working CORS headers

## License

This project is free software distributed under the [**MIT License**](LICENSE).

### Contributors

By committing your code to the code repository you agree to release the code under the MIT License attached to the repository.

***

Maintained by [Michael Becker](https://mlbr.xyz)
