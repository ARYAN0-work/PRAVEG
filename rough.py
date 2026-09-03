import pandas as pd
df1 = pd.read_excel("Datastructure.xlsx", sheet_name="Sheet1")
df2 = pd.read_excel("Datastructure.xlsx", sheet_name="Sheet2")
combined = pd.merge(df1, df2, on="Project_id", how="inner", suffixes=("_static", "_snap"))

y = combined["Delay_status"]
for value in y.unique():
    print(repr(value))