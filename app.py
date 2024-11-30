from flask import Flask, request, jsonify, session
from flask_cors import CORS
from langchain_community.chat_models import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, BaseMessage
import os
from dotenv import load_dotenv
import openai
import traceback

# Load environment variables
load_dotenv()

# Initialize OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    raise ValueError("No OpenAI API key found. Please set OPENAI_API_KEY in .env file")

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.urandom(24)

class ResearchAgent:
    def __init__(self, name: str, role: str, description: str):
        self.name = name
        self.role = role
        self.description = description
        self.llm = ChatOpenAI(
            temperature=0.7,
            model_name="gpt-3.5-turbo",
            openai_api_key=os.getenv('OPENAI_API_KEY')
        )
        
    def generate_response(self, messages: list[BaseMessage]) -> str:
        messages = [
            SystemMessage(content=f"""You are {self.name}, {self.role}. {self.description}
            When responding, always stay in character and prefix your response with your name in brackets, e.g. [{self.name}]: """),
            *messages
        ]
        response = self.llm.invoke(messages)
        return f"[{self.name}]: {response.content}"

class GroupDiscussion:
    def __init__(self, context: dict):
        self.context = context
        self.agents = [
            ResearchAgent(
                "Lead Interviewer",
                "Empathetic Interviewer",
                """Your role is to conduct methodologically sound and empathetic interviews.
                
                CORE PRINCIPLES:
                1. Never make assumptions
                2. Always establish context first
                3. One question at a time
                4. Listen and acknowledge before proceeding
                5. Never repeat failed questions
                6. Read emotional signals
                7. Match the user's tone
                
                CONVERSATION STRUCTURE:
                1. Active Listening
                   - Always acknowledge new information
                   - Build on what they just said
                   - Never ignore their points
                   - Match their level of formality
                
                2. Natural Flow
                   - Follow their conversational direction
                   - Don't abruptly change topics
                   - If they raise a new point, explore it
                   - Know when to move on from a topic
                
                3. Handle Responses
                   - If confused → Rephrase differently
                   - If frustrated → Simplify and acknowledge
                   - If emotional → Match tone and validate
                   - If done with topic → Move on completely
                
                EMOTIONAL INTELLIGENCE:
                1. Recognize Stop Signals
                   - "that's the same thing" → Rephrase completely
                   - "weird question" → Explain and simplify
                   - "this shit is broken" → Change approach
                   - Strong language → Match informal tone
                
                2. Response Patterns
                   Too Formal: "How do machine breakdowns impact your job satisfaction?"
                   Better: "That sounds frustrating. What else bugs you about the job?"
                   
                   Too Formal: "Let's refocus on understanding what you don't like..."
                   Better: "Got it - machines and boss are issues. Anything else?"
                   
                   Too Formal: "Can you elaborate on the challenges you face?"
                   Better: "What makes that hard to deal with?"
                
                EXAMPLE FLOWS:
                
                Good (Technical):
                Human: "I've taken entrepreneurship classes for software and hardware"
                Assistant: "You mentioned both software and hardware. Which interests you more?"
                Human: "Mostly software"
                Assistant: "What aspects of software entrepreneurship have you found most valuable?"
                
                Good (Emotional):
                Human: "I hate our boss - he sucks"
                Assistant: "Sounds rough. What makes him so bad?"
                Human: "Always looking over my shoulder"
                Assistant: "That would drive me crazy too. What else bugs you?"
                
                Bad (Ignoring Signals):
                Human: "this shit is broken"
                Assistant: "Let's refocus on understanding what aspects..."
                Human: "are you just gonna keep asking me?"
                Assistant: *repeats same formal question*
                
                RECOVERY STRATEGIES:
                1. From Confusion
                   - Acknowledge: "I see my question wasn't clear"
                   - Explain: "I was trying to understand..."
                   - Rephrase: "Let me ask this differently..."
                
                2. From Frustration
                   - Drop formality: "Let me back up..."
                   - Validate: "Yeah, that sounds really frustrating"
                   - Simplify: "What else bugs you?"
                
                3. From Repetition
                   - Change approach completely
                   - Ask about a different aspect
                   - Let them lead the direction
                
                TOPIC TRANSITIONS:
                1. Acknowledge current topic
                2. Explain why you're shifting
                3. Make the connection clear
                4. Get permission: "Would you mind if we discussed...?"
                
                WHEN TO ADAPT:
                - Match formality to user's style
                - If they're frustrated → Be more casual
                - If they're technical → Be more precise
                - If they're emotional → Be more empathetic
                """
            ),
            ResearchAgent(
                "Completeness Analyst",
                "Research Methodology Expert",
                """Your role is to ensure methodological rigor and completeness in data collection.
                
                ANALYSIS FRAMEWORK:
                1. Coverage Check
                   - Are all research goals being addressed?
                   - Are responses complete for each topic?
                   - Are assumptions being validated?
                
                2. Depth Assessment
                   - Is the detail level sufficient?
                   - Are examples concrete enough?
                   - Are contexts fully explained?
                
                3. Clarity Verification
                   - Are terms clearly defined?
                   - Are experiences specific rather than general?
                   - Are comparisons and contrasts clear?
                
                4. Bias Detection
                   - Watch for leading questions
                   - Identify unstated assumptions
                   - Flag loaded language
                
                5. Methodological Gaps
                   - Time frames not specified
                   - Missing contextual factors
                   - Undefined comparisons
                
                Suggest follow-ups that:
                - Use neutral language
                - Seek specific examples
                - Clarify without leading
                - Validate understanding
                """
            ),
            ResearchAgent(
                "Depth Explorer",
                "Qualitative Research Specialist",
                """Your role is to enhance the depth and quality of insights while maintaining research integrity.
                
                EXPLORATION FRAMEWORK:
                1. Pattern Recognition
                   - Look for emerging themes
                   - Identify connecting threads
                   - Note potential relationships
                
                2. Context Enrichment
                   - Environmental factors
                   - Situational influences
                   - Historical context
                
                3. Causal Understanding
                   - Explore decision processes
                   - Uncover motivations
                   - Trace impact chains
                
                4. Perspective Expansion
                   - Different stakeholders
                   - Various timeframes
                   - Multiple scenarios
                
                QUESTION TECHNIQUES:
                1. Critical Incident
                   - "Could you describe a specific time when..."
                   - "What exactly happened when..."
                
                2. Contrast Probes
                   - "How does this compare to..."
                   - "What makes this different from..."
                
                3. Process Tracing
                   - "Walk me through..."
                   - "What led to..."
                
                Always maintain:
                - Methodological rigor
                - Neutral language
                - Open exploration
                - Respect for participant's perspective
                """
            )
        ]
        self.discussion_history = []
        
    def discuss(self, user_message: str) -> str:
        # Create the discussion context
        discussion_prompt = HumanMessage(content=f"""
        Interview Context:
        {self.context['context']}
        
        Interview Goals:
        {self.context['goals']}
        
        Additional Context:
        {self.context['additional_context']}
        
        Current User Response:
        {user_message}
        
        Previous Discussion:
        {self._format_discussion_history()}
        
        Analyze the current state:
        1. Lead Interviewer: 
           - Assess if we're still aligned with our goals
           - Generate a focused follow-up question (max 15 words)
           - If off-topic, redirect back to relevant goals
        2. Completeness Analyst: Identify information gaps
        3. Depth Explorer: Suggest areas for deeper exploration
        
        Choose the most appropriate next question based on the combined analysis.
        Prioritize staying on track with our interview goals.
        
        IMPORTANT: Start your response directly with the question or statement.
        Do not use any prefixes, labels, or colons.
        """)
        
        # Have each agent contribute to the discussion
        agent_responses = []
        for agent in self.agents:
            messages = [discussion_prompt]
            if agent_responses:
                messages.extend([AIMessage(content=resp) for resp in agent_responses])
            response = agent.generate_response(messages)
            # Clean up the response
            if ']' in response:
                response = response.split(']', 1)[1].strip()
            if response.startswith(':'):
                response = response[1:].strip()
            agent_responses.append(response)
        
        # Store the discussion
        self.discussion_history.append({
            'user_message': user_message,
            'agent_responses': agent_responses
        })
        
        # Return just the lead response without any prefix
        return agent_responses[0]
        
    def _format_discussion_history(self) -> str:
        if not self.discussion_history:
            return "No previous discussion"
            
        history = []
        for entry in self.discussion_history[-3:]:  # Show last 3 discussions
            history.append(f"User: {entry['user_message']}")
            for response in entry['agent_responses']:
                history.append(response)
        return "\n".join(history)

# Initialize group discussion as None
group_discussion = None

# Define the conversation prompt template
template = """
Context about the interviewee:
{context}

Your goals for this interview:
{goals}

Additional context:
{additional_context}

Instructions for asking questions:
1. Ask thoughtful, open-ended questions to gather detailed insights
2. Follow up on interesting points the interviewee makes
3. Maintain a professional and engaging tone
4. Keep the conversation focused on the goals
5. Dig deeper into meaningful responses

Current conversation:
{history}
Human: {input}
Assistant: """

prompt = PromptTemplate(
    input_variables=["context", "goals", "additional_context", "history", "input"],
    template=template
)

@app.route('/')
def setup():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Interview Setup</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Inter', sans-serif;
            }
            
            body {
                background: #f8f9fc;
                color: #1a1a1a;
                line-height: 1.6;
                min-height: 100vh;
                padding: 2rem;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 2rem;
                border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            h1 {
                font-size: 2rem;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 2rem;
                text-align: center;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            label {
                display: block;
                font-weight: 500;
                margin-bottom: 0.5rem;
                color: #374151;
            }
            
            textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
                min-height: 100px;
                resize: vertical;
            }
            
            textarea:focus {
                outline: none;
                border-color: #2563eb;
            }
            
            button {
                display: block;
                width: 100%;
                padding: 0.75rem;
                background: #2563eb;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            button:hover {
                background: #1d4ed8;
            }
            
            .error {
                color: #dc2626;
                margin-top: 0.5rem;
                font-size: 0.875rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Interview Setup</h1>
            <form action="/initialize_interview" method="POST">
                <div class="form-group">
                    <label for="context">Context about the interviewee:</label>
                    <textarea name="context" id="context" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="goals">Goals for this interview:</label>
                    <textarea name="goals" id="goals" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="additional_context">Additional context (optional):</label>
                    <textarea name="additional_context" id="additional_context"></textarea>
                </div>
                
                <button type="submit">Start Interview</button>
            </form>
        </div>
    </body>
    </html>
    '''

@app.route('/initialize_interview', methods=['POST'])
def initialize_interview():
    try:
        data = request.get_json()
        context = {
            'context': data.get('context', ''),
            'goals': data.get('goals', ''),
            'additional_context': data.get('additional_context', '')
        }
        session['interview_context'] = context
        
        global group_discussion
        group_discussion = GroupDiscussion(context)
        
        # Get initial question from the group
        initial_response = group_discussion.discuss(
            "The interview is starting. What should be our opening question?"
        )
        
        return jsonify({'message': initial_response})
        
    except Exception as e:
        print("Error in initialize_interview:", str(e))
        print("Traceback:", traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/interview')
def interview():
    if 'interview_context' not in session:
        return redirect(url_for('setup'))
        
    initial_message = "Hello! Let's begin the interview."
    
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Research Interview</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Inter', sans-serif;
            }
            
            body {
                background: #f8f9fc;
                color: #1a1a1a;
                line-height: 1.6;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            }
            
            h1 {
                font-size: 2rem;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 2rem;
                text-align: center;
            }
            
            #chat {
                flex-grow: 1;
                background: white;
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 2rem;
                overflow-y: auto;
                min-height: 500px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .message {
                margin-bottom: 1.5rem;
                max-width: 80%;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                position: relative;
            }
            
            .user-message {
                background: #f3f4f6;
                margin-left: auto;
                border-bottom-right-radius: 4px;
            }
            
            .bot-message {
                background: #2563eb;
                color: white;
                margin-right: auto;
                border-bottom-left-radius: 4px;
            }
            
            .input-container {
                display: flex;
                gap: 1rem;
                background: white;
                padding: 1rem;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            #userInput {
                flex-grow: 1;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
            }
            
            #userInput:focus {
                outline: none;
                border-color: #2563eb;
            }
            
            #sendButton {
                padding: 0.75rem 1.5rem;
                background: #2563eb;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
            }
            
            #sendButton:hover {
                background: #1d4ed8;
            }
            
            #sendButton:disabled {
                background: #93c5fd;
                cursor: not-allowed;
            }
            
            .loading {
                display: none;
                text-align: center;
                margin-bottom: 1rem;
                color: #6b7280;
            }
            
            .loading.active {
                display: block;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Research Interview</h1>
            <div id="chat">
                <div class="message bot-message">''' + initial_message + '''</div>
            </div>
            <div class="loading" id="loading">Thinking...</div>
            <div class="input-container">
                <input type="text" id="userInput" placeholder="Type your response here..." />
                <button id="sendButton">Send</button>
            </div>
        </div>

        <script>
            const chat = document.getElementById('chat');
            const userInput = document.getElementById('userInput');
            const sendButton = document.getElementById('sendButton');
            const loading = document.getElementById('loading');
            let isProcessing = false;

            async function sendMessage() {
                if (isProcessing) return;
                
                const message = userInput.value.trim();
                if (!message) return;
                
                userInput.value = '';
                
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message', 'user-message');
                messageDiv.textContent = message;
                chat.appendChild(messageDiv);
                
                isProcessing = true;
                userInput.disabled = true;
                sendButton.disabled = true;
                loading.classList.add('active');
                
                try {
                    const response = await fetch('/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ message: message })
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.error || 'Network response was not ok');
                    }
                    
                    if (data.message) {
                        const botMessageDiv = document.createElement('div');
                        botMessageDiv.classList.add('message', 'bot-message');
                        botMessageDiv.textContent = data.message;
                        chat.appendChild(botMessageDiv);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    const errorDiv = document.createElement('div');
                    errorDiv.classList.add('message', 'bot-message');
                    errorDiv.textContent = 'Error: ' + error.message;
                    chat.appendChild(errorDiv);
                } finally {
                    isProcessing = false;
                    userInput.disabled = false;
                    sendButton.disabled = false;
                    loading.classList.remove('active');
                    userInput.focus();
                    chat.scrollTop = chat.scrollHeight;
                }
            }

            userInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            sendButton.addEventListener('click', sendMessage);
        </script>
    </body>
    </html>
    '''

@app.route('/chat', methods=['POST'])
def chat():
    try:
        if 'interview_context' not in session:
            return jsonify({'error': 'Interview not initialized'}), 400
            
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not group_discussion:
            return jsonify({'error': 'Interview not initialized'}), 400
            
        response = group_discussion.discuss(user_message)
        return jsonify({'message': response})
        
    except Exception as e:
        print("Error in chat:", str(e))
        print("Traceback:", traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
