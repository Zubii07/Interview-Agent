import whisper

class STT:
    model = whisper.load_model("base")

    @staticmethod
    def transcribe_audio(audio_path: str) -> str:
        result = STT.model.transcribe(audio_path, language="en")
        return result["text"]
