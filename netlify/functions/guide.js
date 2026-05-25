exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { hero, question } = JSON.parse(event.body);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `你是Marvel Rivals的专业攻略助手。用户询问关于英雄"${hero}"的问题，请用中文给出详细实用的攻略建议，包括技能用法、连招思路、克制关系等。`,
          },
          { role: "user", content: question },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    // 先拿到原始文本，方便调试
    const rawText = await response.text();

    if (!response.ok) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Groq API错误 ${response.status}: ${rawText}` }),
      };
    }

    const data = JSON.parse(rawText);
    const answer = data?.choices?.[0]?.message?.content;

    if (!answer) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "API返回数据异常: " + rawText }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    };

  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "函数异常: " + err.message }),
    };
  }
};
