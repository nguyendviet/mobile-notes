## Full explanation of the templates

For consistency, I'll keep the `.json` format. I know it's easier to write comments with `.yaml`.

### Root Stack
```
"Resources": {
    // Each resource is a stack, hence the type
    "DynamoDBTable": {
        // This stack creates the DynamoDB table
        // with the schema we need for our app.
        "Type": "AWS::CloudFormation::Stack",
        "Properties": {
            "Parameters": {
                "TableName": {
                    "Fn::Sub": "${AWS::StackName}"
                }
            },
            // Since we use nested stack, each template
            // needs to be in an S3 bucket
            // and we use TemplateURL to reference it.
            "TemplateURL": "https://s3.amazonaws.com/YOUR_TEMPLATE_BUCKET/dynamodb.json"
        }
    },
    "S3WebsiteReact": {
        // This stack create the hosting website
    },
    "S3UploadBucket": {
        // This stack create the upload bucket
    },
    "Cognito": {
        "Properties": {
            "Parameters": {
                // Here we use a little trick
                // to remove all the hyphens
                // from the name of the stack
                // to create the Cognito User Pool name
                // because Cognito Identity Pool
                // doesn't allow special characters.
                // More details in the Identity Pool stack.
                "CognitoUserPoolName": {
                    "Fn::Join" : ["",
                        {
                            "Fn::Split": ["-", {
                                "Ref": "AWS::StackName"
                            }]
                        }
                    ]
                }
            }
        }
    },
    "ApiGateway": {
        // Because API Gateway needs the User Pool
        // for the authorizer and the DynamoDB table name
        // so it depends on the 2 resources.
        "DependsOn": ["DynamoDBTable", "Cognito"],
        "Properties": {
            "Parameters": {
                // We get the values from other nested stacks
                // by using Fn::GetAtt from their Outputs
                "CognitoUserPoolArn": {
                    "Fn::GetAtt": [ "Cognito", "Outputs.UserPoolArn" ]
                },
                "DynamoDBStack": {
                    "Fn::GetAtt": [ "DynamoDBTable", "Outputs.DDBStackName" ]
                }
            },
        }
    },
    "IdentityPool": {
        // Same here. The Identity Pool depends on other resources.
        "DependsOn": ["Cognito", "ApiGateway", "S3UploadBucket"],
        "Properties": {
            // Although Identity Pool is part of Cognito
            // it requires API Gateway ID to create
            // the policy for the authorizer.
            // That's why it needs its own template
            // with all the parameters which are values
            // from other stacks' outputs.
            "Parameters": {
                "AppClientId": {
                    "Fn::GetAtt": [ "Cognito", "Outputs.AppClientId" ]
                },
                "UserPoolProviderName": {
                    "Fn::GetAtt": [ "Cognito", "Outputs.ProviderName" ]
                },
                "UserPoolName": {
                    "Fn::GetAtt": [ "Cognito", "Outputs.UserPoolName" ]
                },
                "UploadBucketName": {
                    "Fn::GetAtt": [ "S3UploadBucket", "Outputs.UploadBucketName" ]
                },
                "ApiGatewayId": {
                    "Fn::GetAtt": [ "ApiGateway", "Outputs.ApiGatewayId" ]
                }
            },
        }
    }
},

"Outputs": {
    // The outputs section here is for convenience.
    // It returns all the values you need for your
    // app settings.
}
```

### DynamoDB Stack

```
"Resources": {
    // Define the table with schema
    "DDBTable": {
        "Type": "AWS::DynamoDB::Table",
        "Properties": {
            "TableName": {
                "Ref": "TableName"
            },
            "AttributeDefinitions": [
                {
                    "AttributeName": "userid",
                    "AttributeType": "S"
                },
                {
                    "AttributeName": "noteid",
                    "AttributeType": "S"
                }
            ],
            // These are parittion key and sort key
            "KeySchema": [
                {
                    "AttributeName": "userid",
                    "KeyType": "HASH"
                },
                {
                    "AttributeName": "noteid",
                    "KeyType": "RANGE"
                }
            ]
        }
    },
    "ScalingRole": {
        // Role for scaling
    },
    "WriteScalingPolicy": {
        // Write scaling policy
    }
},
"Outputs": {
    // Return values that other stacks need
    "DDBTableARN": {
        "Value": {
            "Fn::GetAtt": [
                "DDBTable",
                "Arn"
            ]
        },
        // Here we export because we use cross stack references
        // The API Gateway template imports this value.
        "Export": {
            "Name": {
                "Fn::Sub": "${AWS::StackName}-DDBTableARN"
            }
        }
    },
    "DDBTableName": {
        "Value": {
            "Ref": "TableName"
        },
        // Same here
        "Export": {
            "Name": {
                "Fn::Sub": "${AWS::StackName}-DDBTableName"
            }
        }
    },
    // Here we don't need to export because there's no stack
    // will import this value
    "DDBStackName": {
        "Value": {
            "Fn::Sub": "${AWS::StackName}"
        }
    }
}
```

**NOTE**: If you want to hook several apps to one database, it's better to add `"DeletionPolicy" : "Retain"`. [More details](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-deletionpolicy.html).

### Website Bucket Stack

```
"Resources": {
    "S3Bucket": {
        "Properties": {
            // We need public read to host website
            "AccessControl": "PublicRead",
            // Both index and error page point to
            // index.html because of the way
            // React handles routes
            "WebsiteConfiguration": {
                "IndexDocument": "index.html",
                "ErrorDocument": "index.html"
            }
        }
    },
    "BucketPolicy": {
        // Policy that allows public read.
    }
},
"Outputs": {
    // Return some values so other stacks can use.
}
```

**NOTE**: bucket name must be unique.

### Upload Bucket Stack

```
"Resources": {
    // This bucket is used as a storage
    // for our uploaded files.
    "S3Bucket": {
        "Properties": {
            // Allow CORS so we can put and read
            // content from this bucket
            "CorsConfiguration": {
                "CorsRules" : [
                    {
                        "AllowedHeaders": ["*"],
                        "AllowedMethods": [
                            "GET", 
                            "PUT",
                            "POST",
                            "HEAD",
                            "DELETE"
                        ],
                        "AllowedOrigins": ["*"],
                        "MaxAge": 3000
                    }              
                ]
            }
        }
    }
},
"Outputs": {
    // Return values so other stacks can use
}
```

**NOTE**: bucket name must be unique.

### Cognito Stack

```
"Resources": {
    // The properties of the User Pool are self-explanatory.
    "UserPool": {},
    // The properties of the User Pool Client are also self-explanatory.
    "UserPoolClient": {}
},

"Outputs": {
    // Return values so other stacks can use.
}
```

**NOTE**: Even though Identity Pool is part of Cognito, it requires values from other stacks so it's better to have its own stack to prevent **circular dependency between resources**. In this case, if we define Identity Pool in Cognito stack, it will need the API Gateway ID but the API Gateway template needs User Pool ARN.

### API Gateway Stack

```
"Resources": {
    "BaseLambdaExecutionPolicy": {
        // Allow Lambda to write Logs to CloudWatch
    },
    "LambdaRole": {
        // Allow Lambda to do CRUD operations to DynamoDB
    },
    "LambdaFunction": {
        "Properties": {
            // There are different ways to get the
            // Lambda code. Check AWS docs.
            "Code": {}
        }
    },
    // This is IMPORTANT:
    // Without Lambda Permission, the API Gateway
    // cannot invoke the Lambda function
    // which results in a CORS error even if 
    // you enable CORS in your methods.
    // This also shows the API Gateway as the trigger
    // of the Lambda function in the Console,
    // slightly different if you do it manually.
    // When you allow API Gateway to trigger Lambda manually,
    // as described in the manual setup guide,
    // the Console doesn't show it as the trigger.
    "LambdaPermission": {
        "Type": "AWS::Lambda::Permission",
        "Description": "Permission for API GateWay to invoke Lambda.",
        "Properties": {
            "Action": "lambda:invokeFunction",
            "FunctionName": {
                "Fn::GetAtt": [
                    "LambdaFunction",
                    "Arn"
                ]
            },
            "Principal": "apigateway.amazonaws.com",
            "SourceArn": {
                "Fn::Join": [
                    "",
                    [
                        "arn:aws:execute-api:",
                        {
                            "Ref": "AWS::Region"
                        },
                        ":",
                        {
                            "Ref": "AWS::AccountId"
                        },
                        ":",
                        {
                            "Ref": "ApiGateway"
                        },
                        "/*"
                    ]
                ]
            }
        }
    },
    "ApiGatewayRole": {
        // Role for API Authorizer.
    },
    "GatewayAuthorizer": {
        // Use Cognito User Pool to authorise users
    },
    "resourceNotes": {
        // URL /notes
    },
    "resourceNoteId": {
        "Type" : "AWS::ApiGateway::Resource",
        "Properties" : {
            // URL /notes
            "ParentId" : {
                "Ref": "resourceNotes"
            },
            // URL /notes/{noteid}
            "PathPart" : "{noteid}",
        }
    },
    "methodNotesANY": {
        // Method ANY of /notes
        "Type": "AWS::ApiGateway::Method",
        "DependsOn": "LambdaPermission",
        "Properties": {
            // IMPORTANT: this is the method that
            // you use to call API Gateway
            "HttpMethod": "ANY",
            "Integration": {
                "Type": "AWS_PROXY",
                // IMPORTANT: this is the method that
                // API Gateway uses to call Lambda.
                // It must be POST
                // Yeah, I know, it's confusing
                "IntegrationHttpMethod": "POST",
            }
        }
    },
    "methodNotesOPTIONS": {
        // Allow CORS for /notes
    },
    "methodNoteIdANY": {
        // Method ANY of /notes/{noteid}
    },
    "methodNoteIdOPTIONS": {
        // Allow CORS for /notes/{noteid}
    },
    "ApiGatewayDeployment": {
        // Deploy with stage
    }
},

"Outputs": {
    // Return outputs for other stacks to use
}
```

This template took me the most time to troubleshoot. I highly recommend using the Logs from API Gateway test, Lambda test and CloudWatch.

### Identity Pool Stack

```
"Resources": {
    "IdentityPool": {
        "Properties" : {
            "CognitoIdentityProviders": [
                {
                    "ClientId": {
                        "Ref": "AppClientId"
                    },
                    // The Provider Name is actually a
                    // default value from creating
                    // Cognito User Pool
                    // In this case, I get it from
                    // the root stack by using 
                    // "Fn::GetAtt": [ "Cognito", "Outputs.ProviderName" ]
                    // Check the Cognito stack to see
                    // how the Provider Name is returned
                    "ProviderName": {
                        "Ref": "UserPoolProviderName"
                    }
                }
            ],
        }
    },
    "CognitoAuthRole": {
        // Auth Role for API Gateway
    },
    "CognitoUnauthRole": {
        // UnAuth Role for API Gateway
    },
    "IdentityPoolRoles": {
        // Role for Identity Pool
    }
},

"Outputs": {
    // Return value for other stacks to use
}
```
