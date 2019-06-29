## Why you should use cross stack references

From [AWS docs](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/walkthrough-crossstackref.html):
> Cross-stack references let you use a layered or service-oriented architecture. **Instead of including all resources in a single stack**, you create related AWS resources in separate stacks; then you can refer to required resource outputs from other stacks. 

If you're like me (I hate skimming through stack templates with thousands of lines) you'll love cross stack references. They come in handy. If you're familiar with *React components* or *Node.js module.exports function*, you'll love cross stack references. They let you break down a gigantic template into small chunks and help you manage them easily.

I actually use cross stack reference in the `api-gateway` stack: 
- Import the DynamoDB Table ARN (line 91) to create a policy for my Lambda function to write to the table.
- Import the DynamoDB Table Name (line 117) to create a Lambda environment variable.

**Note**: If you want to use cross stack references, make sure you create the resource that you want to get the values from first. That's why in the `root-stack`, my `ApiGateway` `DependsOn` my `DynamoDBTable`.