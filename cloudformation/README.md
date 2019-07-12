# CloudFormation templates

Guide to deploy CloudFormation nested stack to create the full serverless mobile notes app that was described [here](../README.md).

If you want to go deeper into the stacks, go [here](../docs/full-explanation.md).

## Step 1: Set up your template bucket
After cloning this repository:
- Create a bucket that will contain all the templates (`.json` files). [[*](#in-step-1)]
- Upload all template (`.json` files) in this folder `./cloudformation`, except `root-stack.json` because you don't need it in the bucket.

## Step 2: Deploy the templates
- Make sure you have all the permissions you need to all the services that these nested-stack templates will create: CloudFormation, S3, Cognito, API Gateway, Lambda, DynamoDB, IAM.
- Make sure you have the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) installed on your machine.
- Change the `YOUR_TEMPLATE_BUCKET` value in file `./cloudformation/root-stack.json` with your real template bucket name that you created in **Step 1**.
- Run [[*](#in-step-2)]:
```bash
aws cloudformation create-stack --stack-name <YOUR_STACK_NAME> --template-body file://<PATH_TO_THE_ROOT_STACK_TEMPLATE>/root-stack.json --capabilities CAPABILITY_IAM
```
- Go to the Console to check the status of the creation of the nested stack.
- Once your stack (the parent stack, not the nested ones) has the status `CREATE_COMPLETE`, go to its Outputs, you should be able to see all the variables you need for your React code, and also YOUR-APP-URL (`WebsiteUrl`).

## Step 3: Set up the app and test locally
- Go to AWS Console > Lambda > Lambda Function created by the nested stack template > Function code > Code entry type > Select Upload a .zip file then choose the file `./cloudformation/lambda/lambda.zip`. Then remember to Save your function. [[*](#in-step-3)]
- Copy the values you need for the file `aws-variables.js` inside this project: `./mobile-notes/client/src/lib/aws-variables.js`
```javascript
export default {
    s3: {
        REGION: "YOUR_AWS_REGION",
        BUCKET: "YOUR_S3_WEBSITE_BUCKET"
    },
    apiGateway: {
        REGION: "YOUR_AWS_REGION",
        URL: "YOUR_API_GATEWAY_INVOKE_URL"
    },
    cognito: {
        REGION: "YOUR_AWS_REGION",
        USER_POOL_ID: "YOUR_USER_POOL_ID",
        APP_CLIENT_ID: "YOUR_APP_CLIENT_ID",
        IDENTITY_POOL_ID: "YOUR_IDENTITY_POOL_ID"
    }
};
```
- Make sure you have [yarn](https://yarnpkg.com/lang/en/docs/cli/install/) and [Node.js](https://nodejs.org/en/download/package-manager/) installed on your computer. 
- Go to folder `./client`.
- Inside `./client` folder, install dependencies:
```
$ yarn install
```
- If you see `gyp`, `node-gyp` and `node-pre-gyp` error, see [solution](../docs/err/grpc.md).
- Make a build folder:
```
$ yarn build
```
- Copy the content inside the build folder to your S3 bucket [[*](#in-step-3)]:
```
$ aws s3 cp <PATH>/build s3://<YOUR_S3_WEBSITE_BUCKET> --recursive --exclude ".DS_Store"
```
- Start the app locally:
```
$ yarn start
```
- You should be able to see the app on your browser (`localhost:3000`) and it will look like the one you set up manually if you have done it following the guide [here](../README.md).
- Now you can create your account and start writing some notes to test.

## Step 4: Try the app online
- Go to YOUR-APP-URL that you got from the Outputs of your root stack template. 
- Now you can create another account or login (if you have already created one from your local host) and see your notes (if you have done so) pulled from `DynamoDB`.

## Step 5: Get better at it
- Use [SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) to develop your Serverless app.
- Use [taskcat](https://github.com/aws-quickstart/taskcat) to test your CloudFormation templates.
- Use custom bash scripts and alias to save time. [See examples](../docs/bash-functions.md).
- Go further and [create a pipeline to automate your website deployment](https://www.linkedin.com/pulse/provision-your-pipeline-automate-static-site-aws-viet-nguyen/).

## A few notes:

### In step 1:
- You can use a CloudFormation template, the CLI or the Console to create the bucket.
- Don't make the bucket public unless you want to share your templates.
- I recommend you turn on Version Control and Server access logging for the bucket if you plan to keep using it for more templates in the future.

:thinking:
1. Wait. Why would I use nested stack? It seems like more work. => [See answer](../docs/why-nested-stack.md).
1. What about cross stack references? => [See answer](../docs/why-cross-stack.md).

### In step 2:

- Remember S3 bucket names must be unique, so change the bucket templates if you don't create the `root-stack` with a unique name.

### In step 3:
- I know there are other ways to deploy your Lambda code like using SAM, or uploading the .zip file to an S3 bucket so you can use CloudFormation template to retrieve the .zip file from that bucket to your Lambda function, but I'll leave that for you to explore.
- If you set up the app manually following the guide [here](../README.md), you might notice that the Lambda code in `./cloudformation/lambda` is slighly different: instead of using a fixed value for the DynamoDB table (from AWS blog code), I modified it so the code takes the Lambda environment value `TABLE_NAME` to make the code reusable.
- You don't have to exclude .DS_Store if you run on Linux, I pasted the command here for Mac users' convenience.