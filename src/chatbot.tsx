import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import "./global-css/chatbot.css";
import { IonIcon } from '@ionic/react';
import { chatbubblesOutline } from 'ionicons/icons';

const Chatbot: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasEntered, setHasEntered] = useState(false); 
    const [messages, setMessages] = useState<{ text: string, type: 'self' | 'other' }[]>([]);
    const [strictProductSearch, setStrictProductSearch] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isDisplayingMessage, setIsDisplayingMessage] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const textBoxRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const myStorage = localStorage;

        // Initialize or retrieve existing session ID
        let existingSessionId = myStorage.getItem('chatbot_session');
        if (!existingSessionId) {
            existingSessionId = generateSessionId();
            myStorage.setItem('chatbot_session', existingSessionId);
        }
        setSessionId(existingSessionId);

        // Keep the existing chatID logic if needed for other purposes
        if (!myStorage.getItem('chatID')) {
            myStorage.setItem('chatID', createUUID());
        }

        setTimeout(() => {
            setHasEntered(true);
        }, 300); 
    }, []);

    const generateSessionId = (): string => {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };

    const createUUID = () => {
        let s: string[] = [];
        const hexDigits = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = hexDigits.substr((parseInt(s[19], 16) & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "-";
        return s.join("");
    };

    const openElement = () => {
        setIsExpanded(true);
        if (textBoxRef.current) textBoxRef.current.focus();
    
        if (messages.length === 0) {
            setIsTyping(true);
            setIsDisplayingMessage(true);
            setTimeout(() => {
                displayReply("Mabuhay! Ako si Baby Baka, ang iyong gabay mula sa Tara Kabataan. Paano kita matutulungan sa araw na ito?");
            }, 1000);
        }
    };    

    const closeElement = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsExpanded(false);
    };

    const sendNewMessage = () => {
        if (isTyping || isDisplayingMessage) return; // Prevent sending while typing or displaying
        if (textBoxRef.current) {
            const newMessage = textBoxRef.current.innerHTML.replace(/<div>|<br.*?>/ig, '\n').replace(/<\/div>/g, '').trim().replace(/\n/g, '<br>');
            if (!newMessage) return;

            setMessages((prev) => [...prev, { text: newMessage, type: 'self' }]);
            textBoxRef.current.innerHTML = '';
            textBoxRef.current.focus();

            setIsTyping(true);
            setIsDisplayingMessage(true);

            setTimeout(() => {
                strictProductSearch ? searchProduct(newMessage) : handlePredefinedReplies(newMessage);
            }, 500);
        }
    };

    const handlePredefinedReplies = (message: string) => {
        if (isTyping || isDisplayingMessage) return; // Prevent interaction while typing

        setIsTyping(true);
        setIsDisplayingMessage(true);

        const lowerCaseMessage = message.toLowerCase();
        let reply = '';

        if (lowerCaseMessage.includes("ano ang tara kabataan")) {
            reply = "Ang Tara Kabataan (TK) ay isang organisasyon ng mga kabataan sa Maynila na itinatag para isulong ang kaginhawaan ng bawat kabataan at Manilenyo. Pinapahalagahan ng samahan ang pakikipagkapwa ng mga Pilipino na nakasandig sa ating karapatan at pagkakapantay-pantay. Naniniwala ang TK sa kakayahan ng bawat kabataan, sa loob at labas ng paaralan, na siyang higit na dapat mabigyan ng oportunidad na malinang at mapaunlad. Mula rito, mas makikilala ng kabataan ang kaniyang sarili at matatanaw ang kaniyang mahalagang papel sa komunidad, lipunan, at bayan. Mula sa sarili tungo sa bayan ang siyang hinihikayat ng Tara Kabataan sa kaniyang kapwa.";
            displayReply(reply);
        } else if (lowerCaseMessage.includes("paano sumali sa tara kabataan")) {
            reply = "Upang sumali sa Tara Kabataan, maaari mong bisitahin ang aming website at punan ang form para sa pagiging miyembro. Maaari ka ring dumalo sa aming mga kaganapan at pagpupulong upang mas makilala mo ang aming organisasyon at malaman kung paano ka makakasali.";
            displayReply(reply);
        } else if (lowerCaseMessage.includes("ano ang mga adbokasiya ng tara kabataan") || lowerCaseMessage.includes("ano ang advocacies ng tara kabataan")) {
            reply = `Ang mga adbokasiya ng Tara Kabataan (5 K) ay:\n\n1. KALUSUGAN\n   Pagtataguyod ng abot-kaya at makataong serbisyong pangkalusugan para sa lahat.\n\n2. KALIKASAN\n   Pangunguna sa pagkilos para sa katarungang pangklima at pangangalaga sa kapaligiran.\n\n3. KARUNUNGAN\n   Pagsusulong ng komprehensibo at nagpapalaya na edukasyon.\n\n4. KULTURA\n   Pagtitibay ng pambansang pagkakakilanlan at malikhaing pag-iisip.\n\n5. KASARIAN\n   Pagpapahalaga sa pagkakapantay-pantay ng kasarian at inklusibong lipunan.\n\nBisitahin ang pahina ng "About" para sa karagdagang impormasyon.`;
            displayReply(reply);
        } else {
            // Forward to Gemini with session ID
            askGemini(message);
        }
    };
    
    const askGemini = async (message: string) => {
        setIsTyping(true);
        setIsDisplayingMessage(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/askGemini.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    session_id: sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Update session ID if backend provides a new one
            if (data.session_id && data.session_id !== sessionId) {
                setSessionId(data.session_id);
                localStorage.setItem('chatbot_session', data.session_id);
            }

            const reply = data.reply || "Paumanhin, hindi ko masasagot ang iyong katanungan.";
            displayReply(reply);
        } catch (err) {
            console.error("Error contacting Gemini:", err);
            displayReply("An error occurred while contacting Gemini.");
        }
    };
    
    const displayReply = (reply: string) => {
        setIsTyping(false);
        const words = reply.split(' ');
        let currentText = '';
    
        setMessages(prev => [...prev, { text: '', type: 'other' }]);
    
        words.forEach((word, index) => {
            setTimeout(() => {
                currentText += word + ' ';
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { text: currentText.trim(), type: 'other' };
                    return updated;
                });
    
                if (index === words.length - 1) {
                    setIsDisplayingMessage(false);
                }
            }, index * 100);
        });
    };
    
    const searchProduct = (productName: string) => {
        $.ajax({
            url: 'searchProduct.php',
            method: 'POST',
            data: { 
                productName,
                session_id: sessionId 
            },
            success: res => {
                setMessages(prev => [...prev, { text: res, type: 'other' }]);
                setIsDisplayingMessage(false);
            },
            error: () => {
                setMessages(prev => [...prev, { text: "Sorry, something went wrong.", type: 'other' }]);
                setIsDisplayingMessage(false);
            }
        });
    };
    
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messages]);

    const predefinedMessages = [
        "Ano ang Tara Kabataan?",
        "Paano sumali sa Tara Kabataan?",
        "Ano ang mga adbokasiya ng Tara Kabataan?"
    ];

    return (
        <div
            className={`floating-chat ${hasEntered ? 'enter' : ''} ${isExpanded ? 'expand' : ''}`}
            onClick={openElement}
            style={{ bottom: '20px', right: '20px' }}
        >
            <IonIcon icon={chatbubblesOutline} style={{ fontSize: '24px' }} />
            <div className={`chat ${isExpanded ? 'enter' : ''}`} style={{ height: isExpanded ? '500px' : '60px', transition: 'height 0.5s ease-out' }}>
                <div className="headerchat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="title">Tara, Usap!</span>
                    <button onClick={closeElement}>
                        <b className="fa fa-times" aria-hidden="true">x</b>
                    </button>
                </div>
                <ul className="messages" ref={messagesEndRef}>
                    {messages.map((msg, i) => (
                        <li key={i} className={msg.type}><div className="message-content">{msg.text}</div></li>
                    ))}
                    {isTyping && (
                        <li className="other typing-indicator">
                            <div className="message-content typing">
                                <span>•</span><span>•</span><span>•</span>
                            </div>
                        </li>
                    )}
                </ul>
                <div className="footerchat">
                    <div
                        className="text-box"
                        contentEditable
                        ref={textBoxRef}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendNewMessage(); } }}
                        style={{ pointerEvents: isTyping || isDisplayingMessage ? 'none' : 'auto' }}
                    ></div>
                    <button
                        id="sendMessage"
                        onClick={sendNewMessage}
                        disabled={isTyping || isDisplayingMessage}
                        className={isTyping || isDisplayingMessage ? "disabled-button" : ""}
                    >send</button>
                </div>
                <div className="predefined-messages">
                    {predefinedMessages.map((q, i) => (
                        <button
                            key={i}
                            className={`predefined-message ${isTyping || isDisplayingMessage ? "disabled-button" : ""}`}
                            onClick={() => {
                                if (!isTyping && !isDisplayingMessage) {
                                    setMessages(prev => [...prev, { text: q, type: 'self' }]);
                                    handlePredefinedReplies(q);
                                }
                            }}
                            disabled={isTyping || isDisplayingMessage}
                        >{q}</button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Chatbot;