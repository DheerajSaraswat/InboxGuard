import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const baseTransition = {
  duration: 1.2,
  ease: [0.25, 0.1, 0.25, 1],
};

const AnimationWrapper = ({ children }) => (
  <div
    style={{
      width: "100%",
      minHeight: "100vh", // always fills screen
      backgroundColor: "black", // or your app bg, prevents white flash
      display: "flex",
      flexDirection: "column",
      justifyContent: "center", // center vertically
    }}
  >
    <AnimatePresence mode="wait">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {React.Children.map(children, (child, i) =>
          typeof child === "string" ? (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  ...baseTransition,
                  delay: i * 0.3, // slower stagger
                  opacity: { duration: 0.8 },
                },
              }}
              exit={{
                opacity: 0,
                y: -10,
                transition: { ...baseTransition, duration: 0.6 },
              }}
              style={{ display: "inline-block", color: "white" }}
            >
              {child}
            </motion.span>
          ) : (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  ...baseTransition,
                  delay: i * 0.3,
                  opacity: { duration: 0.8 },
                },
              }}
              exit={{
                opacity: 0,
                y: -10,
                transition: { ...baseTransition, duration: 0.6 },
              }}
            >
              {child}
            </motion.div>
          )
        )}
      </div>
    </AnimatePresence>
  </div>
);

export default AnimationWrapper;
