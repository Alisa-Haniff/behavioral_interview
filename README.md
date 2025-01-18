# behavioral_interview
# React Chat App with ChatGPT Integration

This is a React-based chat application built using Vite and the ChatGPT API. The app features an elegant chat interface powered by the [ChatScope Chat UI Kit](https://github.com/chatscope/chat-ui-kit-react) and securely manages API keys using environment variables.

Steps to Build the Application

## 1. Initialize a Vite Project
        bash
            npm create vite@latest app -- --template react
                creates a new Vite project named "app" using the React template
## 2. Navigate to the Directory
        bash
            cd app
## 3. Install Dependencies
        bash
            npm install
               This command installs all the dependencies required by the Vite project as listed in the package.json file. These include core libraries like React and ReactDOM.              
## 4. Install ChatScope Chat UI Kit
        bash
            npm install @chatscope/chat-ui-kit-react
                This step adds the ChatScope Chat UI Kit to the project, which provides pre-built, customizable components for creating a professional chat interface.
## 5. Start the Development Server
        bash
          npm run dev
                This starts the Vite development server

## 6. I created a .env file for the API Key  
        bash
            VITE_OPENAI_API_KEY=your_openai_api_key
            
                            
