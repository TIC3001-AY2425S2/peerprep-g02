# List of images to load
images=("collab-service" "user-service" "frontend" "question-service" "matching-service", "nginx-gateway")

# Loop through each image and load it into Minikube
for image in "${images[@]}"
do
  minikube image load $image
  echo "Loaded image: $image"
done