import { createSlice, current } from "@reduxjs/toolkit";

const initialState ={
    currentUser: null,
    error: null,
    loading: false
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers:{
        signInStart: (state) => {
            state.loading= true;
            state.error= null;
        },
        siginInSuccess: (state, action) =>{
            state.currentUser= action.payload;
        state.loading= false;
        state.error= null;

    },
     
    signInFailure: ( state, action)=> {
        state.loading= false;
        state.error= action.payload;

    },
    updateStart: (state)=>{
        state.loading = true;
        state.error = null;
    },
    updateSuccess: (state, action) =>{
        state.currentUser = action.payload;
        state.loading = false;
        state.error = null;
    },
    updateFailure: (state, action) =>{
        state.loading = false;
        state.error = action.payload;
    },

}
});

export const{signInStart,siginInSuccess,signInFailure,updateStart,updateSuccess,updateFailure}= userSlice.actions;

export default userSlice.reducer;