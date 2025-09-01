from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import json
import os

load_dotenv()
class QuestionGeneratorChain:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            openai_api_key=os.getenv('OPENAI_API_KEY')
        )
        
        self.question_prompt = PromptTemplate(
            input_variables=["resume", "jd", "difficulty_level", "num_questions","randomizer"],
            template="""
You are an expert technical interviewer. Your task is to generate relevant and **unique** interview questions 
based on the candidate's resume and the job description.

**Resume:**
{resume}

**Job Description:**
{jd}

**Instructions:**
- Generate {num_questions} interview questions at {difficulty_level} difficulty level.
- Ensure the set of questions is different every time by varying focus, wording, or topics. 
- Use the following randomizer as context to avoid repetition across retries: {randomizer}.
- Focus on skills, education, experience, and technologies mentioned in both resume and job description.
- Strictly follow this mix:
  * 40% Technical
  * 30% Behavioral
  * 20% Scenario-based
  * 10% Experience-based
- Each question should be clear, specific, and professional.
- Avoid yes/no type questions.

**Difficulty Guidelines:**
- Easy: Basic concepts, straightforward experience questions
- Medium: Problem-solving scenarios, intermediate technical concepts
- Hard: Complex system design, advanced technical challenges, leadership scenarios

Return the questions in valid JSON format ONLY:
{{
    "questions": [
        {{
            "id": 1,
            "question": "Question text here",
            "type": "technical|behavioral|scenario|experience",
            "category": "relevant skill/topic",
            "expected_duration": "time in minutes",
            "difficulty": "{difficulty_level}"
        }}
    ]
}}

"""
        )
        
        # Create the chain
        self.chain = self.question_prompt | self.llm

    def generate_questions(self, resume, jd, difficulty_level, num_questions, randomizer):
        response = self.chain.invoke({
            "resume": resume,
            "jd": jd,
            "difficulty_level": difficulty_level,
            "num_questions": num_questions,
            "randomizer": randomizer
        })

        content = response.content if hasattr(response, 'content') else str(response)
        
        try:
            # Try to parse it as JSON if LLM returns a stringified JSON
            return json.loads(content.strip())
        except json.JSONDecodeError as e:
            # Fallback: return plain text as-is
            return {"questions": content.strip(), "error": f"JSON parsing failed: {str(e)}"}
        except Exception as e:
            # General fallback
            return {"questions": content.strip(), "error": f"Unexpected error: {str(e)}"}
