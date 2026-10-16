import {createSlice} from '@reduxjs/toolkit'

// Used only when nothing is persisted yet; must match the pre-paint script in
// index.html (saved choice → OS preference → dark).
const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    return 'dark';
};

const initialState={
    theme: getInitialTheme(),
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers:{
        toggleTheme: (state)=>{
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
    }
});

export const {toggleTheme} = themeSlice.actions;

export default themeSlice.reducer;
