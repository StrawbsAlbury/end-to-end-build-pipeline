pipeline {
    agent any

    environment {
        APP_NAME        = "demo-web"
        CLOUDSMITH_ORG  = "pa-test-org"
        CLOUDSMITH_REPO = "jenkins-build-pipeline"
        REGISTRY        = "docker.cloudsmith.io"
        IMAGE_TAG       = "latest"

        FULL_IMAGE = "${REGISTRY}/${CLOUDSMITH_ORG}/${CLOUDSMITH_REPO}/${APP_NAME}:${IMAGE_TAG}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Test') {
            steps {
                dir('app') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t ${FULL_IMAGE} .'
            }
        }

        stage('Docker Login to Cloudsmith') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'cloudsmith-docker-creds',
                    usernameVariable: 'CS_USER',
                    passwordVariable: 'CS_TOKEN'
                )]) {
                    sh 'echo "$CS_TOKEN" | docker login ${REGISTRY} -u "$CS_USER" --password-stdin'
                }
            }
        }

        stage('Docker Push') {
            steps {
                sh 'docker push ${FULL_IMAGE}'
            }
        }

       stage('Kubernetes Deploy') {
            steps {
                sh '''
                set -e

                echo "Applying deployment spec..."
                kubectl apply -f k8s/deployment.yaml

                echo "Applying service..."
                kubectl apply -f k8s/service.yaml

                echo "Applying ingress..."
                kubectl apply -f k8s/ingress.yaml

                echo "Current deployments:"
                kubectl get deploy

                echo "Current pods:"
                kubectl get pods -o wide

                echo "Current services:"
                kubectl get svc -o wide

                echo "Current ingresses:"
                kubectl get ingress
                '''
            }
        }




        stage('Smoke Test') {
            steps {
                script {
                    // Find a RUNNING demo-web pod
                    def podName = sh(
                        script: "kubectl get pods -l app=demo-web --field-selector=status.phase=Running -o jsonpath='{.items[0].metadata.name}'",
                        returnStdout: true
                    ).trim()

                    echo "Running smoke test inside pod: ${podName}"

                    sh """
                    set -e
                    kubectl exec ${podName} -- sh -c \\
                        "curl -fsS http://localhost:3000 | grep 'Cloudsmith + Jenkins + Minikube Demo'"
                    """

                    echo "Smoke test inside pod succeeded."
                    echo "Open http://demo.localtest.me in your browser."
                }
            }
        }

    }

    post {
        success {
            echo "Deployment successful. Open the Minikube URL in your browser."
        }
        failure {
            echo "Pipeline failed. Check the stage logs above."
        }
    }
}
