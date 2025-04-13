# List of images to load
$imageNames = @("collab-service", "user-service", "frontend", "question-service", "matching-service", "nginx-gateway")

# Loop through each image name and load it into Minikube
foreach ($image in $imageNames) {
  minikube.exe image load $image
  Write-Host "Loaded image: $image"
}