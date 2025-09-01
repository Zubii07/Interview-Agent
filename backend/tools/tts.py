from gtts import gTTS

def text_to_speech(text, filename="q1"):
    tts = gTTS(text)
    path = f"static/audio/{filename}.mp3"
    tts.save(path)
    return f"/static/audio/{filename}.mp3"
