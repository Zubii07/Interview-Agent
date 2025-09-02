// import React from 'react';
// 
// export default function Footer() {
// 	return (
// 		<footer className="py-8 text-center text-sm text-gray-500">
// 			<p>© {new Date().getFullYear()} Interview Agent</p>
// 		</footer>
// 	);
// }


import React from 'react';
import { Linkedin, Github } from 'lucide-react';

const Footer = () => (
  <footer className="bg-black text-white border-t border-gray-800 mt-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Interview Assistant
          </span>
        </div>
        <p className="text-gray-400 mb-8 max-w-2xl">
          Revolutionizing the interview process with AI-powered voice technology.
          Practice, improve, and ace your next interview with confidence.
        </p>
        <div className="flex space-x-6">
          <a 
            href="https://www.linkedin.com/in/muhammad-zohaib-2786b8265/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white transition-all duration-300"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a 
            href="https://github.com/Zubii07" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white transition-all duration-300"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 w-full">
          <p className="text-gray-400 text-sm">© 2025 AI Interview Assistant. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
