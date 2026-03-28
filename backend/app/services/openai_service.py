from openai import OpenAI

client = OpenAI()

def generate_text(prompt: str):

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    return response.output[0].content[0].text