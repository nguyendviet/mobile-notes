## Folder: ./cloudformation

- Contains CloudFormation templates to provision resources. E.g.: database (DynamoDB), storage (S3), etc.
- Use nested stacks with cross-stack references to separate the creation of each resource.

**DONE**:
- Cognito stack.
- Database stack.
- S3 static website stack.

**TODO**:
- API Gateway & Lambda stack.
- Parent stack to cross reference resources.