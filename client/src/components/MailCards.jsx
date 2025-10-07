import React from "react";

export default function MailCards({ isDark, setSelectedEmail }) {
  const emails = [
    {
      id: 1,
      sender: 'security@inboxguard.com',
      subject: 'Suspicious login attempt detected',
      time: 'Today, 2:34 PM',
      preview: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere incidunt nulla consequatur minus minima est eius distinctio amet dolores recusandae, eveniet maiores possimus deleniti dolore nostrum pariatur dicta ratione iste fuga eos aliquid harum, rem nihil. Natus aliquid qui quis deserunt magni molestias omnis porro explicabo, obcaecati optio in debitis voluptas ",
      important: true,
    },
    {
      id: 2,
      sender: 'noreply@github.com',
      subject: 'Welcome to InboxGuard!',
      time: 'Yesterday',
      preview: 'Thank with o signing supp...',
      important: false,
    }
  ];

  return (
    <div className={`flex flex-col gap-8 py-8 px-8 ${isDark ? 'bg-transparent' : 'bg-[#F3F6FA]'}`}>
      {emails.map(email => (
        <div
          key={email.id}
          className={`rounded-3xl flex p-4 px-10 cursor-pointer transition-all duration-200 shadow-2xl hover:scale-[1.01] border-2 ${isDark ? 'bg-gradient-to-br from-[#232326]/90 via-[#18181b]/90 to-[#232326]/80 border-[#232326]' : 'bg-white border-[#e5e7eb] '}`}
        
          onClick={() => setSelectedEmail(email)}
        >
          <div className={`flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative ${isDark ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-blue-200 ' : 'bg-blue-300 text-white'} text-xl`}>
              {email.sender[0].toUpperCase()}
              {isDark && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full " />}
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-base font-semibold ${isDark ? 'text-blue-200' : 'text-black'}`}>{email.sender}</span>
              <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-black'} font-sans`}>{email.subject}</span>
              <span className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-500'} truncate`} style={{display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px'}}>{email.preview}</span>
            </div>
          </div>
          <div className=" flex ml-auto flex-col gap-2">
            <div className="flex flex-col justify-between ml-auto">
              {email.important && (
                <span className="bg-[#E50914] text-white px-4 py-2 w-40 rounded-lg text-sm font-bold flex items-center gap-2 mb-3 shadow-lg">
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z' /></svg>
                  Security Alert
                </span>
              )}
            </div>
            <div className="flex ml-auto justify-end mt-auto">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{email.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
