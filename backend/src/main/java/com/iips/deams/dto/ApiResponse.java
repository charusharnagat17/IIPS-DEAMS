package com.iips.deams.dto;

public record ApiResponse<T>(boolean success, String message, T data) {
    public static <T> ApiResponse<T> ok(String msg, T data) { return new ApiResponse<>(true, msg, data); }
    public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, "Success", data); }
    public static <T> ApiResponse<T> error(String msg) { return new ApiResponse<>(false, msg, null); }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public T getData() { return data; }
}
