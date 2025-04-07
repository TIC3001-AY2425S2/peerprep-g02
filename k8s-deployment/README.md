# Kubernetes (Minikube) Deployment README

## Prerequisites

### 1. Minikube
Ensure that Minikube is installed on your workstation. If Minikube is not yet installed, follow the official [Minikube installation guide](https://minikube.sigs.k8s.io/docs/).

### 2. Environment Files
For each service, ensure that the corresponding `*.docker-env-configmap.yaml` files are updated if there are any changes to the environment variables or configurations used in the services.

### 3. Images
- The private Docker images must be copied to Minikube's Docker environment using the `minikube image import <image-name>` command. Alternatively, you can use the scripts in the `scripts` folder to load all images into Minikube.
- **Note**: Be sure to build your Docker images first before importing them into Minikube.

### 4. Local DNS Configuration
Add the following entries to your system's `hosts` file to map local addresses for the services:
  ```
  127.0.0.1 peerprep.local
  127.0.0.1 nginx-gateway
  ```
#### Quick start 
1. Start minikube using `minikube start`
2. Enable the addons for Auto Scalling and Dashboarding
```
minikube addons enable metrics-server
minikube addons enable dashboard
```
3. Deploy the containers `kubectl apply -f k8s-deployment`
4. Validate all pods are running `kubectl get pods`
5. Port forward frontend service and nginx service
```
kubectl port-forward svc/nginx-gateway 8080:8080
kubectl port-forward svc/frontend 3000:3000
```
6. After port forwarding, you can access the services on:

  - Frontend : http://peerprep.local:3000
  - Nginx Gateway: http://nginx-gateway:8080

7. The auto scaler is configured to scale when CPU cross 600%, you can use the following command increase load on cpu
8. TBU