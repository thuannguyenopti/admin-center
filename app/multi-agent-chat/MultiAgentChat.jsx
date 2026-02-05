import { useState } from 'react';

export default function MultiAgentChat() {
  const [showContinueBar, setShowContinueBar] = useState(false);
  const [currentTask, setCurrentTask] = useState('Product page optimization');
  const [messages, setMessages] = useState([
    {
      type: 'user',
      content: 'Help me improve conversion on my product page',
      avatar: '👤'
    },
    {
      type: 'agent',
      agent: 'Content Agent',
      agentColor: '#7c3aed',
      agentIcon: '✍️',
      content: 'I\'ll analyze your current messaging and value proposition. Let me review the page content...',
    },
    {
      type: 'agent',
      agent: 'Content Agent',
      agentColor: '#7c3aed',
      agentIcon: '✍️',
      content: 'I\'ve reviewed your product page. The headline could be more benefit-focused. Current: "Advanced Analytics Platform" → Suggested: "Turn Data Into Revenue-Driving Decisions in Minutes"',
    },
    {
      type: 'agent',
      agent: 'Data Agent',
      agentColor: '#0891b2',
      agentIcon: '📊',
      content: 'Building on that content analysis, I\'ve pulled your experiment data. Your current page has a 2.3% conversion rate with 156ms average engagement time. The bounce rate from paid traffic is 68%, suggesting a messaging mismatch.',
    },
    {
      type: 'agent',
      agent: 'Design Agent',
      agentColor: '#ea580c',
      agentIcon: '🎨',
      content: 'From a UX perspective, I see some issues. The CTA is below the fold on mobile (87% of your traffic). The hero section lacks visual hierarchy. I recommend: 1) Move CTA above fold, 2) Add visual proof points, 3) Reduce cognitive load in the first section.',
    },
    {
      type: 'unified',
      content: '**Unified Recommendation:**\n\nBased on our collaborative analysis:\n• **Content**: Revise headline to focus on speed + business impact\n• **Data**: Target paid traffic first (highest bounce rate)\n• **Design**: Restructure mobile experience with CTA prioritization\n\nExpected impact: 15-20% conversion lift based on similar optimization patterns.',
    }
  ]);
  const [chatState, setChatState] = useState('completed'); // 'completed', 'waiting-for-task'

  const handleNewUserMessage = () => {
    // Simulate user asking for help again
    setShowContinueBar(true);
    setChatState('waiting-for-task');
  };

  const handleContinueTask = () => {
    setShowContinueBar(false);
    setChatState('completed');

    // Add continuation messages
    setMessages([...messages,
      {
        type: 'user',
        content: 'Can you help me with the mobile layout?',
        avatar: '👤'
      },
      {
        type: 'agent',
        agent: 'Design Agent',
        agentColor: '#ea580c',
        agentIcon: '🎨',
        content: 'Continuing our product page optimization... For the mobile layout, let me create a detailed wireframe focusing on the above-the-fold improvements we discussed.',
      }
    ]);
  };

  const handleStartNew = () => {
    setShowContinueBar(false);
    setChatState('completed');
    setCurrentTask('Mobile layout redesign');

    // Add new task messages
    setMessages([...messages,
      {
        type: 'task-divider',
        content: 'New Task Started'
      },
      {
        type: 'user',
        content: 'Can you help me with the mobile layout?',
        avatar: '👤'
      },
      {
        type: 'agent',
        agent: 'Design Agent',
        agentColor: '#ea580c',
        agentIcon: '🎨',
        content: 'Starting fresh with mobile layout design. What specific page or section would you like to focus on?',
      }
    ]);
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#f9fafc',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        height: '100%',
        background: 'white',
        border: '1px solid #dadfeb',
        borderRadius: '8px',
        boxShadow: '-6px 6px 25px 0px rgba(12,16,29,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>

        {/* Header */}
        <div style={{
          borderBottom: '1px solid #e9edf5',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px'
            }}>☰</button>
            <button style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px'
            }}>➕</button>
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#2e3442'
          }}>Opal</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px'
            }}>⛶</button>
            <button style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px'
            }}>⋯</button>
          </div>
        </div>

        {/* Chat Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {messages.map((msg, idx) => {
            if (msg.type === 'task-divider') {
              return (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '16px 0'
                }}>
                  <div style={{ flex: 1, height: '1px', background: '#e9edf5' }}></div>
                  <span style={{
                    fontSize: '12px',
                    color: '#66708c',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>{msg.content}</span>
                  <div style={{ flex: 1, height: '1px', background: '#e9edf5' }}></div>
                </div>
              );
            }

            if (msg.type === 'user') {
              return (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    background: '#e9edf5',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    maxWidth: '70%',
                    fontSize: '14px',
                    color: '#080736',
                    lineHeight: '1.6'
                  }}>
                    {msg.content}
                  </div>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#e9edf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>
                    {msg.avatar}
                  </div>
                </div>
              );
            }

            if (msg.type === 'unified') {
              return (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, #ede9fe 0%, #f3f4f6 100%)',
                  padding: '16px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #7c3aed',
                  fontSize: '14px',
                  color: '#080736',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.content}
                </div>
              );
            }

            // Agent message
            return (
              <div key={idx} style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: msg.agentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {msg.agentIcon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: msg.agentColor
                    }}></div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: msg.agentColor
                    }}>
                      {msg.agent}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#080736',
                    lineHeight: '1.6'
                  }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Task Continuation Bar (shown above input) */}
        {showContinueBar && (
          <div style={{
            background: '#ede9fe',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #e9edf5',
            gap: '12px'
          }}>
            <button
              onClick={handleContinueTask}
              style={{
                flex: 1,
                background: 'transparent',
                border: '2px solid #7c3aed',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#7c3aed',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f5f3ff'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>↻</span>
              <span>Continue: {currentTask}</span>
            </button>
            <button
              onClick={handleStartNew}
              style={{
                background: 'transparent',
                border: '1px solid #c4b5fd',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                color: '#7c3aed',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f5f3ff'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Start new
            </button>
          </div>
        )}

        {/* Input Area */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e9edf5'
        }}>
          <div style={{
            border: '1px solid #7c3aed',
            borderRadius: '8px',
            padding: '12px',
            background: 'white',
            minHeight: '88px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <textarea
              placeholder="Ask Opal anything..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                color: '#2e3442',
                resize: 'none',
                lineHeight: '1.6'
              }}
              disabled={showContinueBar}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px'
                }}>🤖</button>
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px'
                }}>📎</button>
              </div>
              <button
                onClick={handleNewUserMessage}
                disabled={showContinueBar}
                style={{
                  background: showContinueBar ? '#e9edf5' : '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: showContinueBar ? 'not-allowed' : 'pointer',
                  opacity: showContinueBar ? 0.5 : 1
                }}
              >
                {showContinueBar ? 'Choose task option' : 'Demo: Ask Again'}
              </button>
            </div>
          </div>
          <p style={{
            fontSize: '11px',
            color: '#66708c',
            marginTop: '4px',
            lineHeight: '16px'
          }}>
            Opal can make mistakes. Double-check its responses.
          </p>
        </div>

        {/* Demo Instructions Overlay */}
        {!showContinueBar && chatState === 'completed' && (
          <div style={{
            position: 'absolute',
            bottom: '120px',
            right: '40px',
            background: '#7c3aed',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            maxWidth: '280px',
            lineHeight: '1.5'
          }}>
            <strong>Demo: </strong>Click "Demo: Ask Again" to see the task continuation pattern in action
          </div>
        )}
      </div>
    </div>
  );
}
