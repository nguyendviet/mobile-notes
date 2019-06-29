## Full explanation of the templates

For consistency, I'll keep the `.json` format. I know it's easier to write comments with `.yaml`.

### Root Stack
```json
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

```json
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

### Website Bucket Stack

```json
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

### Upload Bucket Stack

```json
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