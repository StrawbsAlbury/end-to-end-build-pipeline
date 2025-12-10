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
                  if kubectl get deployment demo-web-deployment >/dev/null 2>&1; then
                    kubectl set image deployment/demo-web-deployment demo-web=${FULL_IMAGE} --record
                  else
                    kubectl apply -f k8s/deployment.yaml
                  fi

                  kubectl apply -f k8s/service.yaml
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                script {
                    def url = sh(
                        script: "minikube service demo-web-service --url",
                        returnStdout: true
                    ).trim()

                    echo "Testing URL: ${url}"

                    sh "curl -f ${url} | grep 'Cloudsmith + Jenkins + Minikube Demo'"
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
