package com.example.voteconomy.ui.route

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Button
import androidx.compose.material.Card
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.material.OutlinedButton
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.voteconomy.ui.data.Option
import com.example.voteconomy.ui.data.Poll
import com.example.voteconomy.ui.data.Result
import com.example.voteconomy.ui.viewmodel.PollViewModel
import timber.log.Timber

class PollRoute {
}

@Composable
fun PollHome(viewModel: PollViewModel, onCreatePollClick: () -> Unit){
    val pollResult: Result<List<Poll>> by viewModel.fetchAllPolls.observeAsState(Result.Success(emptyList()))
    when (pollResult) {
        is Result.Loading -> ShowProgress()
        is Result.Success -> {
            PollScreen(
                pollList = (pollResult as Result.Success<List<Poll>>).data)
        }
        is Result.Failure -> ShowError((pollResult as Result.Failure<List<Poll>>).exception)
    }
}

@Composable
private fun PollScreen(pollList:List<Poll>){
    Column(modifier = Modifier.fillMaxHeight()) {
        PollListComponent(modifier = Modifier.padding(bottom = 32.dp),pollList = pollList)
    }
}

@Composable
fun PollListComponent(modifier: Modifier = Modifier, pollList: List<Poll>) {
    val context = LocalContext.current
    Column(modifier = modifier) {
        Text(modifier = Modifier.padding(start = 16.dp,top = 8.dp),text = "All Polls",fontSize = 20.sp,fontWeight = FontWeight.Bold,style = TextStyle(color = Color.Gray ))
        LazyRow{
            items(pollList) { poll ->
                PollComponent(poll = poll,
                    onOptionClick = { option ->
                        showMessage(context, "Voted for $option")
                    }, onVotePollClick = {
                        showMessage(context, "Clicked to view poll results")
                    })
            }
        }
    }
}

@Composable
fun PollComponent(
    poll: Poll,
    onOptionClick: (Option) -> Unit,
    onVotePollClick: (Poll) -> Unit) {

    val voteState = remember { mutableStateOf(false)}

    Card(modifier = Modifier.width(300.dp).padding(16.dp), elevation = 8.dp, shape = RoundedCornerShape(8.dp)) {
        Column(modifier = Modifier.padding(8.dp)) {
            Spacer(modifier = Modifier.padding(top = 8.dp))
            for (option in poll.options) {
                OutlinedButton(modifier = Modifier.fillMaxWidth().padding(top = 4.dp, end = 8.dp, start = 8.dp), onClick = {
                    voteState.value = true
                    onOptionClick(option)
                }) {
                    Text(text = option.name, maxLines = 1)
                }
            }

            Spacer(modifier = Modifier.padding(top = 16.dp))

            Button(onClick = {
                onVotePollClick(poll)
            }, modifier = Modifier.width(200.dp).align(Alignment.CenterHorizontally).clip(
                CircleShape
            ),enabled = voteState.value) {
                Text(text = "Vote")
            }

            Spacer(modifier = Modifier.padding(bottom = 8.dp))
        }
    }
}

@Composable
fun ShowProgress() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator()
    }
}

@Composable
fun ShowError(exception: Exception) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text = "An error ocurred fetching the polls.")
    }
    Timber.e("PollFetchError", exception.message!!)
}


fun showMessage(context: Context, message:String){
    Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
}
