from typing import Dict, List
import os
from dataclasses import dataclass
from langchain_community.chat_models import ChatOpenAI

@dataclass
class InterviewPlan:
    interview_type: str
    key_topics: List[str]
    suggested_questions: List[str]
    personality_traits: List[str]
    communication_style: str
    special_considerations: List[str]

class PlanningAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0.7,
            model_name="gpt-3.5-turbo",
            openai_api_key=os.getenv('OPENAI_API_KEY')
        )
        
    def create_interview_plan(self, context: str, background: str, goals: str) -> InterviewPlan:
        # Combine all information for the LLM
        prompt = f"""
        As an expert interview planner, analyze the following information and create a detailed interview plan:
        
        CONTEXT:
        {context}
        
        CANDIDATE BACKGROUND:
        {background}
        
        INTERVIEW GOALS:
        {goals}
        
        Based on this information, provide a structured analysis in the following JSON format:
        {{
            "interview_type": "type of interview and approach",
            "key_topics": ["list of main topics to cover"],
            "suggested_questions": ["list of strategic questions"],
            "personality_traits": ["traits the interviewer should exhibit"],
            "communication_style": "recommended communication approach",
            "special_considerations": ["important points to keep in mind"]
        }}
        """
        
        try:
            messages = [
                {"role": "system", "content": "You are an expert interview planner, skilled at creating strategic interview approaches."},
                {"role": "user", "content": prompt}
            ]
            response = self.llm.invoke(messages)
            
            # Parse the response into our InterviewPlan structure
            plan_dict = eval(response.content)
            return InterviewPlan(**plan_dict)
            
        except Exception as e:
            print(f"Error in creating interview plan: {e}")
            # Return a basic plan in case of error
            return InterviewPlan(
                interview_type="general",
                key_topics=["background", "experience", "goals"],
                suggested_questions=["Could you tell me about yourself?"],
                personality_traits=["professional", "friendly"],
                communication_style="balanced and professional",
                special_considerations=["maintain professional atmosphere"]
            )
    
    def initialize_agents(self, plan: InterviewPlan) -> Dict:
        """
        Initialize the interview and topic agents with the planned approach
        """
        initialization_prompt = f"""
        Initialize interview session with the following parameters:
        
        Interview Type: {plan.interview_type}
        Key Topics: {', '.join(plan.key_topics)}
        Personality Traits: {', '.join(plan.personality_traits)}
        Communication Style: {plan.communication_style}
        Special Considerations: {', '.join(plan.special_considerations)}
        
        Initial questions to consider: {', '.join(plan.suggested_questions)}
        """
        
        try:
            messages = [
                {"role": "system", "content": "You are initializing an interview session based on a strategic plan."},
                {"role": "user", "content": initialization_prompt}
            ]
            response = self.llm.invoke(messages)
            
            return {
                "initialization_message": response.content,
                "plan": plan
            }
            
        except Exception as e:
            print(f"Error in initializing agents: {e}")
            return {
                "initialization_message": "Interview session initialized with standard parameters.",
                "plan": plan
            }
