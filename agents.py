from langchain_community.chat_models import ChatOpenAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, BaseMessage
import os
import re

class InterviewAgent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.llm = ChatOpenAI(
            temperature=0.7,
            model_name="gpt-3.5-turbo",
            openai_api_key=os.getenv('OPENAI_API_KEY')
        )
        self.conversation_state = {
            'current_topic': None,
            'attempted_topics': set(),
            'failed_topics': set(),
            'asked_questions': set(),
            'short_answer_count': 0,
            'topic_attempt_count': 0
        }

    def generate_response(self, user_message: str, context: dict) -> str:
        # Update conversation state based on user message
        self._update_state(user_message)
        
        system_message = self._get_system_prompt()
        user_context = self._format_context(user_message, context)
        
        messages = [
            system_message,
            HumanMessage(content=user_context)
        ]
        
        response = self.llm.invoke(messages)
        
        # Store the question to avoid repetition
        question = self._extract_question(response.content)
        if question:
            self.conversation_state['asked_questions'].add(question.lower())
        
        return response.content

    def _extract_question(self, text: str) -> str:
        """Extract the main question from the response."""
        # Look for question marks
        questions = re.findall(r'[^.!?]*\?', text)
        if questions:
            return questions[0].strip()
        return None

    def _update_state(self, user_message: str):
        # Detect short or struggling answers
        words = user_message.split()
        is_short_answer = len(words) <= 3
        
        if is_short_answer:
            self.conversation_state['short_answer_count'] += 1
        else:
            self.conversation_state['short_answer_count'] = 0

        # Detect struggle signals
        struggle_signals = [
            'i dont know', 'not sure', 'confused', 'dont understand',
            'what do you mean', '??', 'why', 'can we move on', 
            'different topic', 'next question'
        ]
        
        is_struggling = any(signal in user_message.lower() for signal in struggle_signals)
        
        # Handle topic changes
        if is_struggling or self.conversation_state['short_answer_count'] >= 2:
            if self.conversation_state['current_topic']:
                self.conversation_state['failed_topics'].add(
                    self.conversation_state['current_topic']
                )
            self.conversation_state['current_topic'] = None
            self.conversation_state['topic_attempt_count'] = 0
            self.conversation_state['short_answer_count'] = 0
        
        # Track topic attempts
        if self.conversation_state['current_topic']:
            self.conversation_state['topic_attempt_count'] += 1
            if self.conversation_state['topic_attempt_count'] >= 3:
                self.conversation_state['failed_topics'].add(
                    self.conversation_state['current_topic']
                )
                self.conversation_state['current_topic'] = None
                self.conversation_state['topic_attempt_count'] = 0

    def _get_system_prompt(self) -> SystemMessage:
        base_prompt = f"""You are an empathetic interviewer having a natural conversation.

KEY PRINCIPLES:
1. NEVER REPEAT - Each question must be unique
2. RESPECT SIGNALS - If someone struggles, change topics immediately
3. STAY FRESH - Don't return to topics that didn't work
4. BE NATURAL - Talk like a real person, not a survey bot

CONVERSATION RULES:
1. If user gives short answers twice in a row -> Change topic
2. If user struggles with a topic 3 times -> Abandon that topic completely
3. Never ask about topics marked as failed: {self.conversation_state['failed_topics']}
4. Never repeat these previous questions: {self.conversation_state['asked_questions']}

SIGNS TO CHANGE TOPIC:
- Short answers (1-3 words)
- "I don't know" or "Not sure"
- Confusion signals ("??", "what do you mean")
- Explicit requests ("can we move on", "next question")

GOOD TOPIC CHANGES:
✓ "Let's try something different - [new topic]"
✓ "How about we talk about [new topic] instead?"
✓ "That's fine, let's switch gears. [new topic]"
✓ "No problem, let me ask about [new topic] instead"

Current failed topics: {self.conversation_state['failed_topics']}
Current topic attempts: {self.conversation_state['topic_attempt_count']}
Short answer count: {self.conversation_state['short_answer_count']}
"""
        return SystemMessage(content=base_prompt)

    def _format_context(self, user_message: str, context: dict) -> str:
        return f"""
Context: {context.get('context', '')}
Goals: {context.get('goals', '')}
Additional Info: {context.get('additional_context', '')}

User's message: {user_message}

Remember:
1. Never repeat any of these questions: {self.conversation_state['asked_questions']}
2. Never return to these failed topics: {self.conversation_state['failed_topics']}
3. If user is struggling, immediately switch to a new topic
4. Keep responses natural and conversational
"""

class InterviewManager:
    def __init__(self, context: dict):
        self.context = context
        self.agent = InterviewAgent("Interviewer", "Empathetic Conversation Partner")
        self.conversation_history = []

    def chat(self, user_message: str) -> str:
        response = self.agent.generate_response(user_message, self.context)
        
        self.conversation_history.append({
            'user': user_message,
            'agent': response
        })
        
        return response
