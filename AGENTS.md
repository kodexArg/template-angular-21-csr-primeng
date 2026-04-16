# Agent Guidelines

This document contains global guidelines for the AI agents working in this project.

## Single Source of Truth (SSOT)

- The file `src/theme.css` is the **Single Source of Truth (SSOT)** for the completely site's colorimetry, typography, and base CSS variables.
- All variables for colors, fonts, and global base styles must be declared and managed in `src/theme.css`.
- When applying or discussing styling requirements, you must base your decisions on the variables found in `src/theme.css`. Do not hardcode values if they can be integrated or read from the SSOT.

## Skills 

For specific details on how to handle different technical requirements (e.g., Angular Signals, Form design, PrimeNG Componentization), refer to the individual skills defined in the `.agents/skills/` directory. Let these skills be your primary source of instructions for feature development.
