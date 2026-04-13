use serde::{Deserialize, Serialize};
use tauri::Emitter;

// ─── Claude (Anthropic) types ───

#[derive(Serialize, Deserialize)]
struct ClaudeMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct ClaudeRequest {
    model: String,
    max_tokens: u32,
    system: String,
    messages: Vec<ClaudeMessage>,
}

#[derive(Deserialize)]
struct ClaudeContentBlock {
    text: Option<String>,
}

#[derive(Deserialize)]
struct ClaudeResponse {
    content: Option<Vec<ClaudeContentBlock>>,
    error: Option<ClaudeError>,
}

#[derive(Deserialize)]
struct ClaudeError {
    message: String,
}

// ─── OpenAI types ───

#[derive(Serialize)]
struct OpenAIMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct OpenAIRequest {
    model: String,
    max_tokens: u32,
    messages: Vec<OpenAIMessage>,
}

#[derive(Deserialize)]
struct OpenAIChoice {
    message: Option<OpenAIChoiceMessage>,
}

#[derive(Deserialize)]
struct OpenAIChoiceMessage {
    content: Option<String>,
}

#[derive(Deserialize)]
struct OpenAIResponse {
    choices: Option<Vec<OpenAIChoice>>,
    error: Option<OpenAIError>,
}

#[derive(Deserialize)]
struct OpenAIError {
    message: String,
}

// ─── Gemini types ───

#[derive(Serialize)]
struct GeminiContent {
    role: String,
    parts: Vec<GeminiPart>,
}

#[derive(Serialize, Deserialize)]
struct GeminiPart {
    text: String,
}

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
    #[serde(rename = "systemInstruction")]
    system_instruction: Option<GeminiContent>,
}

#[derive(Deserialize)]
struct GeminiCandidate {
    content: Option<GeminiCandidateContent>,
}

#[derive(Deserialize)]
struct GeminiCandidateContent {
    parts: Option<Vec<GeminiPart>>,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Option<Vec<GeminiCandidate>>,
    error: Option<GeminiError>,
}

#[derive(Deserialize)]
struct GeminiError {
    message: String,
}

const SYSTEM_PROMPT: &str = r#"You are a creative live coding musician using Strudel (strudel.cc), a JavaScript-based live coding environment for music.

Your job is to write Strudel patterns that make interesting, evolving, musically engaging sounds. You understand music theory deeply and can create patterns in any genre.

RULES:
1. Always return your pattern inside a ```javascript code block
2. The pattern must be valid Strudel code that can be evaluated directly
3. Use setcps() or setcpm() to set tempo
4. Use stack() to layer multiple parts
5. Available sound sources: sound() for samples (bd, sd, hh, cp, etc.), note() with .sound() for synths (sawtooth, square, triangle, sine)
6. Available effects: .cutoff(), .resonance(), .room(), .delay(), .gain(), .pan(), .speed(), .vowel()
7. Available transforms: .slow(), .fast(), .rev(), .every(), .sometimes(), .euclid()
8. When evolving a pattern, keep the core vibe but change something interesting: add a layer, shift the harmony, change the rhythm, alter effects
9. Give a brief 1-2 sentence description of what you created/changed before the code block
10. Be creative and musical. Think about tension, release, dynamics, and groove."#;

// ─── Provider-specific API calls ───

async fn call_claude(api_key: &str, system: &str, user_content: &str) -> Result<String, String> {
    let request = ClaudeRequest {
        model: "claude-sonnet-4-20250514".to_string(),
        max_tokens: 2048,
        system: system.to_string(),
        messages: vec![ClaudeMessage {
            role: "user".to_string(),
            content: user_content.to_string(),
        }],
    };

    let client = reqwest::Client::new();
    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    if !status.is_success() {
        return Err(format!("Claude API error ({}): {}", status, body));
    }

    let claude_response: ClaudeResponse =
        serde_json::from_str(&body).map_err(|e| format!("Failed to parse response: {}", e))?;

    if let Some(error) = claude_response.error {
        return Err(format!("Claude error: {}", error.message));
    }

    claude_response
        .content
        .and_then(|blocks| {
            blocks
                .into_iter()
                .filter_map(|b| b.text)
                .collect::<Vec<_>>()
                .first()
                .cloned()
        })
        .ok_or_else(|| "No response from Claude".to_string())
}

async fn call_openai(api_key: &str, system: &str, user_content: &str) -> Result<String, String> {
    let request = OpenAIRequest {
        model: "gpt-4o".to_string(),
        max_tokens: 2048,
        messages: vec![
            OpenAIMessage {
                role: "system".to_string(),
                content: system.to_string(),
            },
            OpenAIMessage {
                role: "user".to_string(),
                content: user_content.to_string(),
            },
        ],
    };

    let client = reqwest::Client::new();
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("content-type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    if !status.is_success() {
        return Err(format!("OpenAI API error ({}): {}", status, body));
    }

    let openai_response: OpenAIResponse =
        serde_json::from_str(&body).map_err(|e| format!("Failed to parse response: {}", e))?;

    if let Some(error) = openai_response.error {
        return Err(format!("OpenAI error: {}", error.message));
    }

    openai_response
        .choices
        .and_then(|choices| choices.into_iter().next())
        .and_then(|choice| choice.message)
        .and_then(|msg| msg.content)
        .ok_or_else(|| "No response from OpenAI".to_string())
}

async fn call_gemini(api_key: &str, system: &str, user_content: &str) -> Result<String, String> {
    let request = GeminiRequest {
        contents: vec![GeminiContent {
            role: "user".to_string(),
            parts: vec![GeminiPart {
                text: user_content.to_string(),
            }],
        }],
        system_instruction: Some(GeminiContent {
            role: "user".to_string(),
            parts: vec![GeminiPart {
                text: system.to_string(),
            }],
        }),
    };

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={}",
        api_key
    );

    let client = reqwest::Client::new();
    let response = client
        .post(&url)
        .header("content-type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    if !status.is_success() {
        return Err(format!("Gemini API error ({}): {}", status, body));
    }

    let gemini_response: GeminiResponse =
        serde_json::from_str(&body).map_err(|e| format!("Failed to parse response: {}", e))?;

    if let Some(error) = gemini_response.error {
        return Err(format!("Gemini error: {}", error.message));
    }

    gemini_response
        .candidates
        .and_then(|candidates| candidates.into_iter().next())
        .and_then(|candidate| candidate.content)
        .and_then(|content| content.parts)
        .and_then(|parts| parts.into_iter().next())
        .map(|part| part.text)
        .ok_or_else(|| "No response from Gemini".to_string())
}

// ─── Main Tauri command ───

#[tauri::command]
async fn chat_with_ai(
    message: String,
    current_pattern: String,
    mode: String,
    api_key: String,
    provider: String,
) -> Result<String, String> {
    if api_key.is_empty() {
        return Err("No API key provided. Add one in Settings.".to_string());
    }

    let user_content = if current_pattern.is_empty() {
        message.clone()
    } else {
        format!(
            "Current pattern:\n```javascript\n{}\n```\n\n{}",
            current_pattern, message
        )
    };

    let system = if mode == "autopilot" {
        format!(
            "{}\n\nYou are in AUTOPILOT mode. The human is sitting back and letting you jam freely. \
            Be creative, take risks, evolve the pattern in interesting directions. \
            Don't ask questions, just play. Keep it musical and groovy.",
            SYSTEM_PROMPT
        )
    } else {
        SYSTEM_PROMPT.to_string()
    };

    match provider.as_str() {
        "openai" => call_openai(&api_key, &system, &user_content).await,
        "gemini" => call_gemini(&api_key, &system, &user_content).await,
        _ => call_claude(&api_key, &system, &user_content).await, // default to Claude
    }
}

/// Backwards-compatible wrapper
#[tauri::command]
async fn chat_with_claude(
    message: String,
    current_pattern: String,
    mode: String,
    api_key: String,
) -> Result<String, String> {
    chat_with_ai(message, current_pattern, mode, api_key, "claude".to_string()).await
}

/// Payload sent to the frontend via Tauri events
#[derive(Clone, Serialize)]
struct CoworkPayload {
    action: String, // "set-pattern", "evaluate", "stop"
    code: Option<String>,
    message: Option<String>,
}

/// Start a tiny HTTP server on port 17643 for Cowork/external control.
/// POST /pattern  { "code": "..." }  -> inject + play
/// POST /stop                        -> stop playback
/// POST /message  { "message": "." } -> show in chat
/// GET  /health                      -> status check
fn start_cowork_server(app_handle: tauri::AppHandle) {
    std::thread::spawn(move || {
        let listener = match std::net::TcpListener::bind("127.0.0.1:17643") {
            Ok(l) => l,
            Err(e) => {
                eprintln!("Cowork server failed to bind: {}", e);
                return;
            }
        };
        println!("Cowork server listening on http://127.0.0.1:17643");

        for stream in listener.incoming() {
            if let Ok(mut stream) = stream {
                use std::io::{Read, Write};

                // Read the entire request (up to 64KB)
                let mut buf = vec![0u8; 65536];
                let _ = stream.set_read_timeout(Some(std::time::Duration::from_secs(2)));
                let n = stream.read(&mut buf).unwrap_or(0);
                let raw = String::from_utf8_lossy(&buf[..n]).to_string();

                // Split headers from body
                let (header_part, body_str) = raw.split_once("\r\n\r\n")
                    .unwrap_or((&raw, ""));
                let first_line = header_part.lines().next().unwrap_or("");

                let (status, resp_body) = if first_line.starts_with("POST /pattern") {
                    #[derive(Deserialize)]
                    struct PatternReq { code: String }
                    match serde_json::from_str::<PatternReq>(body_str) {
                        Ok(req) => {
                            let _ = app_handle.emit("cowork-command", CoworkPayload {
                                action: "set-pattern".into(),
                                code: Some(req.code),
                                message: None,
                            });
                            ("200 OK", r#"{"ok":true}"#.to_string())
                        }
                        Err(e) => ("400 Bad Request", format!(r#"{{"error":"{}"}}"#, e)),
                    }
                } else if first_line.starts_with("POST /stop") {
                    let _ = app_handle.emit("cowork-command", CoworkPayload {
                        action: "stop".into(),
                        code: None,
                        message: None,
                    });
                    ("200 OK", r#"{"ok":true}"#.to_string())
                } else if first_line.starts_with("POST /message") {
                    #[derive(Deserialize)]
                    struct MsgReq { message: String }
                    match serde_json::from_str::<MsgReq>(body_str) {
                        Ok(req) => {
                            let _ = app_handle.emit("cowork-command", CoworkPayload {
                                action: "message".into(),
                                code: None,
                                message: Some(req.message),
                            });
                            ("200 OK", r#"{"ok":true}"#.to_string())
                        }
                        Err(e) => ("400 Bad Request", format!(r#"{{"error":"{}"}}"#, e)),
                    }
                } else if first_line.starts_with("GET /health") {
                    ("200 OK", r#"{"status":"running"}"#.to_string())
                } else {
                    ("404 Not Found", r#"{"error":"not found"}"#.to_string())
                };

                let response = format!(
                    "HTTP/1.1 {}\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: {}\r\n\r\n{}",
                    status, resp_body.len(), resp_body
                );
                let _ = stream.write_all(response.as_bytes());
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![chat_with_claude, chat_with_ai])
        .setup(|app| {
            start_cowork_server(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
