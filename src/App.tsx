  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput(''); // Clear text input box instantly

    // Add user's message bubble to the screen layout
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: userText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const targetUrl = `${API_BASE_URL}/api/chat`;
    console.log(`🚀 Route initialized: streaming from ${targetUrl}`);

    // Create a temporary blank placeholder message for the AI response
    const aiMessageId = crypto.randomUUID();
    const aiPlaceholderMessage: Message = {
      id: aiMessageId,
      text: '',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add the empty bubble to the screen layout so we can stream into it
    setMessages(prev => [...prev, aiPlaceholderMessage]);

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error(`Server status error: ${response.status}`);
      }

      // 🛑 Read the response stream chunk by chunk
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (!reader) throw new Error("Could not initialize text stream reader.");

      let incompleteChunk = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode the stream binary fragment to text
        const textSegment = decoder.decode(value, { stream: true });
        const combinedLines = (incompleteChunk + textSegment).split("\n\n");
        
        // Save the last incomplete line for the next loop run
        incompleteChunk = combinedLines.pop() || "";

        for (const line of combinedLines) {
          if (line.startsWith("data: ")) {
            try {
              const rawDataString = line.slice(6).trim();
              const parsedJSON = JSON.parse(rawDataString);

              if (parsedJSON.reply) {
                // Update the placeholder AI bubble with the fresh incoming word tokens
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, text: msg.text + parsedJSON.reply }
                      : msg
                  )
                );
              }
            } catch (jsonErr) {
              console.log("Skipping partial chunk segment parsing...", jsonErr);
            }
          }
        }
      }

      setIsLoading(false);

    } catch (error) {
      console.error("❌ Connection bridge broken:", error);
      setIsLoading(false);
      
      // Gracefully show the snag fallback bubble to the user if something fails
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Ran into a snag connecting to the streaming engine. Please confirm your Google Colab backend is active.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Remove our empty placeholder and push the error box instead
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId).concat(errorMessage));
    }
  };
