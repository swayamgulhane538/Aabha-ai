import os
import sys

def convert_pptx_to_pdf(input_path, output_path):
    try:
        import comtypes.client
        powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
        powerpoint.Visible = 1
        presentation = powerpoint.Presentations.Open(input_path)
        presentation.SaveAs(output_path, 32) # 32 = ppSaveAsPDF
        presentation.Close()
        powerpoint.Quit()
        print(f"Successfully converted to PDF: {output_path}")
    except Exception as e:
        print(f"Could not convert with comtypes: {e}")

if __name__ == "__main__":
    pptx = r"C:\Users\hp\.gemini\antigravity\scratch\aabha-ai\SIH_2025_PBCOE_Nexora_AABHA_AI.pptx"
    pdf = r"C:\Users\hp\.gemini\antigravity\scratch\aabha-ai\SIH_2025_PBCOE_Nexora_AABHA_AI.pdf"
    convert_pptx_to_pdf(pptx, pdf)
