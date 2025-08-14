import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    email:"",
    isLogin:false
}

export const isLoginSlice = createSlice({
    name:"isLogin",
    initialState,
    reducers:{
        login(state,action){
            state.email = action.payload.email;
            state.isLogin = true;
        },
        logout(state){
            state.email = "";
            state.isLogin = false;
        }
    }
});

export const {login,logout} = isLoginSlice.actions;
export default isLoginSlice.reducer;