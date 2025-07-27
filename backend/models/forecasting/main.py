from lstm import run_lstm_pytorch

if __name__ == "__main__":
    forecast_df = run_lstm_pytorch()
    print("\nForecasted Demand:")
    print(forecast_df)
