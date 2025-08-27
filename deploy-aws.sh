#!/bin/bash

# Configuration
AWS_REGION="eu-north-1"
ECR_REPO_NAME="huntaze-api"
STACK_NAME="huntaze-api-stack"

echo "🚀 Deploying Huntaze API to AWS..."

# 1. Create ECR repository
echo "📦 Creating ECR repository..."
aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION 2>/dev/null || echo "Repository already exists"

# 2. Get ECR login
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com

# 3. Build and push Docker image
echo "🏗️ Building Docker image..."
docker build -t $ECR_REPO_NAME .

echo "📤 Pushing image to ECR..."
docker tag $ECR_REPO_NAME:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest
docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest

# 4. Create secrets in Secrets Manager
echo "🔑 Creating secrets..."
# Note: Replace these with your actual values when deploying
aws secretsmanager create-secret --name huntaze-jwt-secret --secret-string '{"password":"YOUR_JWT_SECRET"}' --region $AWS_REGION 2>/dev/null || echo "JWT secret exists"
aws secretsmanager create-secret --name huntaze-google-oauth --secret-string '{"client_id":"YOUR_GOOGLE_CLIENT_ID","client_secret":"YOUR_GOOGLE_CLIENT_SECRET"}' --region $AWS_REGION 2>/dev/null || echo "Google OAuth secret exists"

# 5. Deploy CloudFormation stack
echo "☁️ Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file cloudformation-template.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides \
    Environment=production \
    DBPassword=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25) \
  --capabilities CAPABILITY_IAM \
  --region $AWS_REGION

# 6. Get outputs
echo "✅ Deployment complete!"
echo "📊 Stack outputs:"
aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION --query 'Stacks[0].Outputs'

# 7. Update Route 53 (optional)
# ALB_DNS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION --query 'Stacks[0].Outputs[?OutputKey==`ALBEndpoint`].OutputValue' --output text)
# echo "🌐 ALB DNS: $ALB_DNS"
# echo "Add a CNAME record for api.huntaze.com pointing to: $ALB_DNS"