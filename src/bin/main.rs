use std::process::ExitCode;

use polaris::App;

#[tokio::main]
async fn main() -> Result<ExitCode, ExitCode> {
    if let Err(e) = App::run().await {
        eprintln!("{:?}", e.0);
        return Err(ExitCode::FAILURE);
    }

    Ok(ExitCode::SUCCESS)
}
