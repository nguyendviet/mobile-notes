In this article, I'm going to walk you through the process of using CloudFormation nested stacks to create a full serverless app **following AWS best practices**. The app we're going to create is the Mobile Notes app which was described in my previous article: [Build a serverless app with React, Node.js and AWS](https://www.linkedin.com/pulse/build-serverless-app-react-nodejs-aws-viet-nguyen/):

1. An Amazon Cognito User Pool authorizer is associated with a RESTful API hosted in Amazon API Gateway. The authorizer authenticates **every** API call made from a mobile app by leveraging a JSON Web Token (JWT) passed in the API call headers.
1. Amazon API Gateway is natively integrated with Amazon Cognito User Pools so the validation of the JWT requires no additional effort from the application developer. Amazon API Gateway then invokes an AWS Lambda function that accesses other AWS services, which in this case is Amazon DynamoDB.
1. When AWS Lambda is invoked, it assumes an AWS Identity and Access Management (IAM) role. The IAM role determines the level of access that AWS Lambda has to Amazon DynamoDB.

{Serverless Diagram}

If you want to go straight to the templates with detailed explanation, please [go to my repository](https://github.com/nguyendviet/mobile-notes/tree/master/cloudformation).

### Why use nested stack?

From [AWS docs](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-nested-stacks.html): 
> As your infrastructure grows, **common patterns** can emerge in which you declare the same components in multiple templates. You can separate out these **common components** and create dedicated templates for them. Then use the resource in your template to reference other templates, creating nested stacks.
...
Using nested stacks to declare common components is considered a best practice.

Think of nested stacks as components (or child stacks), and the root stack (or as I often call it the mother stack) as the controller of all. Some DevOps engineers suggest that you should limit your layers up to 3 and 2 is enough for most cases. I agree with them.

### How?

You upload the child stacks to an S3 bucket and use them inside your mother stack like this:
```json
"Resources": {
    "Resource1": {
        "Type": "AWS::CloudFormation::Stack",
        "Properties": {
            "TemplateURL": "https://s3.amazonaws.com/YOUR_TEMPLATE_BUCKET/resource1.json",
            ...
        }
    },
    "Resource2": {
        "Type": "AWS::CloudFormation::Stack",
        "Properties": {
            "TemplateURL": "https://s3.amazonaws.com/YOUR_TEMPLATE_BUCKET/resource2.json",
            ...
        }
    },
    ...
}
```
Then when you create the mother stack, all the child stacks will be created as nested stacks.

### What if I need to pass the outputs from one nested stack to another?

Good question. You use `"Fn::GetAtt"` to get the `Outputs` from one stack to another. Like this:

Resource1 template:
```json
...
"Outputs": {
    "PassToResource2": {
        "Value": {
            "Fn::GetAtt": [
                "SomeResource",
                "Arn"
            ]
        }
    },
    ...
}
```

You pass the values you need inside the mother (`root-stack`) template. In this case, from Resource1 to Resource2:
```json
"Resources": {
    "Resource1": {
        "Type": "AWS::CloudFormation::Stack",
        ...
    },
    "Resource2": {
        "Type": "AWS::CloudFormation::Stack",
        "DependsOn": "Resource1",
        "Properties": {
            "TemplateURL": "https://s3.amazonaws.com/YOUR_TEMPLATE_BUCKET/resource2.json",
            "Parameters": {
                "ParameterOfResource2": {
                    "Fn::GetAtt": [ "Resource1", "Outputs.PassToResource2" ]
                }
            }
        }
    }
}
```
Note:
- `Resource2` has to depend on `Resource1`.
- The name of the output (`PassToResource2`) must match in both `Resource1` and `root-stack` templates.

So you can use the values inside Resource2 template like this:
```json
"Parameters" : {
    "ParameterOfResource2": {
        "Description": "Some value from Resource1 passed into this stack.",
        "Type": "String"
    },
    ...
}
```