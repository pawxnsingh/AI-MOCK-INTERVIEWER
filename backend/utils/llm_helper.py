from google.genai import Client
from pydantic import BaseModel
from typing import Callable, Type, Union, List, Dict, Any
import logging
from config import config

logger = logging.getLogger(__name__)

def generate_with_gemini(
    prompt: str, 
    response_format: Type[BaseModel] = None,
    tools: List[Union[Dict[str, Any], Callable]] = None,
    tool_config: Dict[str, Any] = None,
    auto_execute_functions: bool = False,
    available_functions: Dict[str, Callable] = None,
    model: str = 'gemini-2.0-flash',
    stream: bool = False,  # Stream parameter to control streaming
    system_instruction: str = None,
) -> Any:
    """
    Generate content using Gemini with optional function calling support.

    This function provides two modes for function calling:
    1. Auto-execution: SDK handles function calls (auto_execute_functions=True)
    2. Manual execution: Returns function calls for you to handle (auto_execute_functions=False)

    Function calling can be configured using:
    - tools: List of functions or schemas defining available functions
    - tool_config: Control function calling behavior (mode: AUTO/ANY/NONE)
    - auto_execute_functions: Whether to automatically execute function calls
    - available_functions: Functions available for execution

    Args:
        prompt: Input text for the model
        response_format: Expected response format as Pydantic model
        tools: Available functions (as callables or schema declarations)
        tool_config: Function calling configuration
        auto_execute_functions: Whether to auto-execute function calls
        available_functions: Functions available for execution
        model: Gemini model to use
        stream: Whether to return a streaming response iterator

    Returns:
        - With stream=True: Iterator yielding response chunks
        - With auto_execute_functions=True: Final text after executing functions
        - With auto_execute_functions=False: Function call data or text response
        - With response_format: Parsed response in specified format
    """
    try:
        client = Client(api_key=config.GEMINI_API_KEY)
        # Create configuration for request
        request_config = {
            'temperature': 0.5, # todo :: agent.config can return this if set by user 
        }
        
        # Add response format if provided
        if response_format:
            request_config['response_mime_type'] = 'application/json'
            request_config['response_schema'] = response_format.model_json_schema()
        
        # Prepare tools based on what was provided
        prepared_tools = tools
        
        # If we have callables in tools, convert them to function declarations
        if tools and any(callable(tool) for tool in tools):
            # Create automatic function calling config if auto execution is enabled
            if auto_execute_functions:
                if not available_functions:
                    # Create available_functions dictionary from callables in tools
                    available_functions = {
                        func.__name__: func for func in tools if callable(func)
                    }
                    
                # Add automatic function calling config
                request_config['automatic_function_calling'] = {
                    'disable': False  # Enable automatic function calling
                }
                
        
        # Add tool config if provided
        if tool_config:
            request_config['tool_config'] = tool_config
            
        # Add prepared tools to config
        if prepared_tools:
            request_config['tools'] = prepared_tools
        
        if system_instruction:
            request_config['system_instruction'] = system_instruction
        
        
        # Handle streaming responses
        if stream:
            # Return streaming response
            return client.models.generate_content_stream(
                model=model,
                contents=prompt,
                config=request_config
            )
        else:
            # Non-streaming mode (original behavior)
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=request_config
            )
            
            # If auto_execute_functions is False, return function call info or text
            if not auto_execute_functions:
                # Check for function calls - supporting both Gemini 1.5 and 2.0 formats
                if tools:
                    # For Gemini 2.0 compositional function calling (multiple function calls)
                    if hasattr(response, 'function_calls') and response.function_calls:
                        function_calls = []
                        for fc in response.function_calls:
                            function_calls.append({
                                'name': fc.name,
                                'args': fc.args
                            })
                        if len(function_calls) == 1:
                            return {'function_call': function_calls[0]}
                        return {'function_calls': function_calls}
                    
                    # For single function call (traditional format)
                    elif hasattr(response, 'candidates') and response.candidates:
                        candidate = response.candidates[0]
                        if hasattr(candidate, 'content') and candidate.content:
                            for part in candidate.content.parts:
                                if hasattr(part, 'function_call'):
                                    return {
                                        'function_call': {
                                            'name': part.function_call.name,
                                            'args': part.function_call.args
                                        }
                                    }
            
                # Return parsed response if format specified, otherwise return text
                if response_format:
                    try:
                        return response_format.model_validate_json(response)
                    except Exception as e:
                        # If parsing fails, return the raw text and log the error
                        logger.warning("[generate_with_gemini] :: Failed to parse response as %s. Returning raw response.", response_format.__name__)
                        return response
                return response
            else:
                # For auto execution, the SDK should have already executed the functions
                # Just return the final text response
                return response
            
    except Exception as e:
        raise Exception(f"Error generating content with Gemini: {str(e)}")
