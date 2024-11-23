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
    deleteUserStart: (state)=>{
        state.loading = true;
        state.error = null;

    },
    
    deleteUserSuccess: (state, action) =>{
        state.currentUser = null;
        state.loading = false;
        state.error = null;
    },

    deleteUserFailure: (state, action) =>{
        state.loading = false;
        state.error = action.payload;
    },
    siginOutSuccess: (state) =>{
        state.currentUser = null;
        state.loading = null;
        state.error = false;
    },   

}
});

export const{signInStart,siginInSuccess,signInFailure,
    updateStart,updateSuccess,updateFailure,
    deleteUserStart,deleteUserSuccess,deleteUserFailure,
    siginOutSuccess
} = userSlice.actions;

export default userSlice.reducer;