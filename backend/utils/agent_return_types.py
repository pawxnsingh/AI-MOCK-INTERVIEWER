from pydantic import BaseModel, Field
from typing import List, Optional
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
    
# class InterviewAnalyserAgentResV1(BaseModel):
#     patience: str = Field(description="A score for patience showed by the candidate on a scale of 0 to 10")
#     preparedness: str = Field(description="A score for preparedness by the candidate on a scale of 0 to 10")
#     confidence: str = Field(description="A score for confidence showed by the candidate on a scale of 0 to 10")
#     fluency: str = Field(description="A score for the fluency of the answers by the candidate on a scale of 0 to 10")
#     top_strengths: str = Field(description="An elabortive description of the strengths of the candidate shown in the interview. It has to be objective, concise, in-detail and atleast 2 paragraph.")
#     key_improvements: str = Field(description="An elabortive description of the key areas of improvement of the candidate shown in the interview. It has to be objective, concise, in-detail and atleast 2 paragraph.")
#     feedback: str = Field(description="A elaborative description on suggestions and feedbacks for the candidate on how to improve their scores for a real interview.")

class StrengthOrImprovement(BaseModel):
    title: str = Field(description="Short title summarizing the strength or improvement area.")
    description: str = Field(description="Detailed explanation of the strength or improvement area.")

class InterviewFeedback(BaseModel):
    summary: str = Field(description="Concise summary of the candidate's overall performance and impression.")
    what_went_well: List[str] = Field(description="List of things the candidate did well.")
    areas_to_improve: List[str] = Field(description="List of areas where the candidate can improve.")
    how_to_improve: List[str] = Field(description="Actionable suggestions for improvement.")
    pro_tip: str = Field(description="A single, actionable pro tip for the candidate.")

# class InterviewAnalyserAgentResV2(BaseModel):
#     patience: Optional[str] = Field(description="Assessment of patience (e.g., 'Excellent', 'Good', 'Average', 'Needs Improvement'). NOTE: dont fill in blank or N/A")
#     preparedness: Optional[str] = Field(description="Assessment of preparedness (e.g., 'Excellent', 'Good', 'Average', 'Needs Improvement'). NOTE: dont fill in blank or N/A")
#     confidence: Optional[str] = Field(description="Assessment of confidence (e.g., 'Excellent', 'Good', 'Average', 'Needs Improvement'). NOTE: dont fill in blank or N/A")
#     fluency: Optional[str] = Field(description="Assessment of fluency (e.g., 'Excellent', 'Good', 'Average', 'Needs Improvement'). NOTE: dont fill in blank or N/A")
#     top_strengths: List[StrengthOrImprovement] = Field(description="List of top strengths with title and description.")
#     key_improvements: List[StrengthOrImprovement] = Field(description="List of key improvement areas with title and description.")
#     feedback: InterviewFeedback = Field(description="Structured feedback object with summary, what went well, areas to improve, how to improve, and a pro tip.")
  
class LastInterviewValues(BaseModel):
    patience: int = Field(description="Previous interview patience score (0-10)")
    preparedness: int = Field(description="Previous interview preparedness score (0-10)")
    confidence: int = Field(description="Previous interview confidence score (0-10)")
    fluency: int = Field(description="Previous interview fluency score (0-10)")

class MetricFeedback(BaseModel):
    summary: str = Field(description="Concise summary of the candidate's performance for this specific metric.")
    what_went_well: List[str] = Field(description="List of things the candidate did well for this metric.")
    areas_to_improve: List[str] = Field(description="List of areas where the candidate can improve for this metric.")
    how_to_improve: List[str] = Field(description="Actionable suggestions for improvement for this metric.")
    pro_tip: str = Field(description="A single, actionable pro tip for the candidate for this metric.")

class DetailedFeedback(BaseModel):
    confidence: MetricFeedback = Field(description="Detailed feedback for confidence metric")
    fluency: MetricFeedback = Field(description="Detailed feedback for fluency metric")
    patiency: MetricFeedback = Field(description="Detailed feedback for patience metric")
    preparedness: MetricFeedback = Field(description="Detailed feedback for preparedness metric")

class InterviewAnalyserAgentResV3(BaseModel):
    overall_score: int = Field(description="Overall interview score out of 100")
    patience: int = Field(description="Patience score out of 10")
    preparedness: int = Field(description="Preparedness score out of 10")
    confidence: int = Field(description="Confidence score out of 10")
    fluency: int = Field(description="Fluency score out of 10")
    # last_interview_values: LastInterviewValues = Field(description="Scores from the previous interview for comparison")
    top_strengths: List[StrengthOrImprovement] = Field(description="List of top strengths with title and description.")
    key_improvements: List[StrengthOrImprovement] = Field(description="List of key improvement areas with title and description.")
    feedback: DetailedFeedback = Field(description="Detailed feedback for each metric with comprehensive analysis")

# class InterviewAnalyserAgentRes(BaseModel):
#     v1: InterviewAnalyserAgentResV1
#     v2: InterviewAnalyserAgentResV2  
#     v3 : InterviewAnalyserAgentResV3

class AgentTypesEnum(enum.Enum):
    resume_structuring_agent = ResumeStructuringAgentRes
    question_gen_agent = QuestionGenAgentRes
    interview_analysis_agent = InterviewAnalyserAgentResV3