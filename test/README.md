- Testing `SampleNetworkCrossStack` and `SampleWebAppCrossStack`. Trying to create a root stack that gets properties from child stacks.

## TODO:

Root stack:
- Reference: Cognito (User Pool, User Pool Client), API Gateway, Lambda functions, DynamoDB with **roles**.

Child stacks:
- Each stack creates a resource (e.g. Cognito User Pool, DynamoDB, etc.), exports the outputs to root stack to use.