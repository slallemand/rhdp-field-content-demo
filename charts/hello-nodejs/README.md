# Hello RHDP Field Content - Node.js Application

Simple Node.js application that displays "Hello RHDP Field Content" with Red Hat branding.

## Features

- **Built on Red Hat UBI**: Uses `registry.access.redhat.com/ubi8/nodejs-18`
- **OpenShift S2I Build**: Builds directly in OpenShift using BuildConfig
- **Health checks**: Liveness and readiness probes
- **Auto-scaling ready**: Configure replicas in values.yaml
- **Secure Route**: HTTPS with edge termination

## What Gets Deployed

1. **Namespace**: `hello-nodejs`
2. **ImageStream**: For the built container image
3. **BuildConfig**: Builds from Git using UBI Node.js 18 image
4. **Deployment**: Runs 2 replicas (configurable)
5. **Service**: ClusterIP on port 8080
6. **Route**: HTTPS route to access the application

## Enable in values.yaml

```yaml
helmCharts:
  hello-nodejs:
    enabled: true  # Set to true
    namespace: hello-nodejs
    wave: 10
    source:
      repoURL: https://github.com/slallemand/rhdp-field-content-demo.git
      targetRevision: HEAD
      path: charts/hello-nodejs
    values:
      replicas: 2
```

## Access the Application

After deployment, find the route:

```bash
oc get route -n hello-nodejs
```

Open the URL in a browser to see the "Hello RHDP Field Content!" page.

## Application Details

- **Framework**: Express.js
- **Port**: 8080
- **Endpoints**:
  - `/` - Main page with Red Hat branding
  - `/health` - Health check endpoint

## Build Process

1. ArgoCD creates the BuildConfig
2. OpenShift triggers a build from Git
3. Dockerfile uses Red Hat UBI Node.js 18 base image
4. npm installs dependencies
5. Image is pushed to internal registry
6. Deployment uses the built image

## Customization

Edit `charts/hello-nodejs/values.yaml`:

```yaml
namespace: hello-nodejs
replicas: 3  # Scale up/down
image:
  name: hello-nodejs
  tag: latest
port: 8080
```
