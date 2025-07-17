from pydantic import BaseModel, Field
from typing import List
import enum

class ResumeSection(BaseModel):
      company_name: str = Field(description="The name of the company where the experience was obtained.")
      experience: int = Field(description="The total duration of employment in this organization.")
      acheivements: List[str] = Field(description="List of achievements divided into granular descriptions of points")
       
class ResumeStructuringAgentRes(BaseModel):
    sections : List[ResumeSection]

class GeneratedQuestion(BaseModel):
    question: str = Field(description="The constructed question")
    reference: str = Field(description="The reference taken from the user's context to craft this question")
    goal: str = Field(description="The goal/reason for crafting this question and what it represents")
      
class QuestionGenAgentRes(BaseModel):
    questions : List[GeneratedQuestion]
    
class InterviewAnalyserAgentRes(BaseModel):
    patience: str = Field(description="A score for patience showed by the candidate on a scale of 0 to 10")
    preparedness: str = Field(description="A score for preparedness by the candidate on a scale of 0 to 10")
    confidence: str = Field(description="A score for confidence showed by the candidate on a scale of 0 to 10")
    fluency: str = Field(description="A score for the fluency of the answers by the candidate on a scale of 0 to 10")
    top_strengths: str = Field(description="An elabortive description of the strengths of the candidate shown in the interview. It has to be objective, concise, in-detail and atleast 2 paragraph.")
    key_improvements: str = Field(description="An elabortive description of the key areas of improvement of the candidate shown in the interview. It has to be objective, concise, in-detail and atleast 2 paragraph.")
    feedback: str = Field(description="A elaborative description on suggestions and feedbacks for the candidate on how to improve their scores for a real interview.")
    
  
class AgentTypesEnum(enum.Enum):
    resume_structuring_agent = ResumeStructuringAgentRes
    question_gen_agent = QuestionGenAgentRes
    interview_analysis_agent = InterviewAnalyserAgentRes